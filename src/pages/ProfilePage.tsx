import { useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  Timestamp,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Transaction,
} from 'firebase/firestore'
import { db } from '../firebase'

interface ProfilePageProps {
  authUser: User
}

interface UserProfileDoc {
  displayName?: string
  username?: string
  status?: string
  about?: string
  email?: string
  createdAt?: Timestamp
  usernameLastChangedAt?: Timestamp
}

const USERNAME_REGEX = /^[a-z0-9_]{4,20}$/
const USERNAME_COOLDOWN_DAYS = 14
const USERNAME_COOLDOWN_MS = USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

const toDate = (value?: Timestamp) => {
  if (!value) {
    return null
  }

  const parsed = value.toDate()
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value?: Date | null) => {
  if (!value) {
    return 'Now available'
  }

  return value.toLocaleDateString()
}

function ProfilePage({ authUser }: ProfilePageProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'account'>('profile')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')
  const [about, setAbout] = useState('')

  const [currentUsername, setCurrentUsername] = useState('')
  const [usernameLastChangedAt, setUsernameLastChangedAt] = useState<Date | null>(null)

  const profileRef = useMemo(() => doc(db, 'profiles', authUser.uid), [authUser.uid])

  const loadProfile = async () => {
    setProfileLoading(true)
    setError('')

    try {
      const snapshot = await getDoc(profileRef)

      if (!snapshot.exists()) {
        const fallbackName = authUser.displayName || authUser.email?.split('@')[0] || 'Compiler User'
        setDisplayName(fallbackName)
        setUsername('')
        setCurrentUsername('')
        setStatus('')
        setAbout('')
        setUsernameLastChangedAt(null)
        return
      }

      const data = snapshot.data() as UserProfileDoc
      setDisplayName(data.displayName || authUser.displayName || authUser.email?.split('@')[0] || 'Compiler User')
      setUsername(data.username || '')
      setCurrentUsername(data.username || '')
      setStatus(data.status || '')
      setAbout(data.about || '')
      setUsernameLastChangedAt(toDate(data.usernameLastChangedAt))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [profileRef])

  const nextUsernameChangeAt = useMemo(() => {
    if (!usernameLastChangedAt) {
      return null
    }

    return new Date(usernameLastChangedAt.getTime() + USERNAME_COOLDOWN_MS)
  }, [usernameLastChangedAt])

  const canChangeUsername = useMemo(() => {
    if (!nextUsernameChangeAt) {
      return true
    }

    return Date.now() >= nextUsernameChangeAt.getTime()
  }, [nextUsernameChangeAt])

  const usernameHint = canChangeUsername
    ? 'User ID available now'
    : `Available change on ${formatDate(nextUsernameChangeAt)}`

  const validateProfile = (nextDisplayName: string, nextUsername: string, nextStatus: string, nextAbout: string) => {
    if (!nextDisplayName) {
      return 'Profile name is required.'
    }

    if (nextDisplayName.length > 50) {
      return 'Profile name should be 50 characters or less.'
    }

    if (!USERNAME_REGEX.test(nextUsername)) {
      return 'User ID must be 4-20 characters with lowercase letters, numbers, or underscore.'
    }

    if (nextStatus.length > 60) {
      return 'Status should be 60 characters or less.'
    }

    if (nextAbout.length > 500) {
      return 'About me should be 500 characters or less.'
    }

    return ''
  }

  const updateWithTransaction = async (
    tx: Transaction,
    nextDisplayName: string,
    nextUsername: string,
    nextStatus: string,
    nextAbout: string,
  ) => {
    const profileSnap = await tx.get(profileRef)
    const existing = (profileSnap.data() || {}) as UserProfileDoc
    const previousUsername = existing.username || ''
    const usernameChanged = nextUsername !== previousUsername

    if (usernameChanged && existing.usernameLastChangedAt) {
      const earliestChangeTime = existing.usernameLastChangedAt.toDate().getTime() + USERNAME_COOLDOWN_MS
      if (Date.now() < earliestChangeTime) {
        throw new Error(`You can change your User ID after ${new Date(earliestChangeTime).toLocaleDateString()}.`)
      }
    }

    if (usernameChanged) {
      const usernameRef = doc(db, 'reservedUsernames', nextUsername)
      const usernameSnap = await tx.get(usernameRef)
      const usernameOwner = usernameSnap.exists() ? (usernameSnap.data().ownerId as string) : ''

      if (usernameSnap.exists() && usernameOwner !== authUser.uid) {
        throw new Error('This User ID is already taken and cannot be used.')
      }

      if (!usernameSnap.exists()) {
        tx.set(usernameRef, {
          ownerId: authUser.uid,
          createdAt: serverTimestamp(),
        })
      }
    }

    tx.set(
      profileRef,
      {
        displayName: nextDisplayName,
        username: nextUsername,
        status: nextStatus,
        about: nextAbout,
        email: authUser.email || '',
        updatedAt: serverTimestamp(),
        createdAt: profileSnap.exists() ? existing.createdAt || serverTimestamp() : serverTimestamp(),
        ...(usernameChanged ? { usernameLastChangedAt: serverTimestamp() } : {}),
      },
      { merge: true },
    )
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const nextDisplayName = displayName.trim()
    const nextUsername = username.trim().toLowerCase()
    const nextStatus = status.trim()
    const nextAbout = about.trim()

    const validationError = validateProfile(nextDisplayName, nextUsername, nextStatus, nextAbout)
    if (validationError) {
      setError(validationError)
      setSaving(false)
      return
    }

    if (nextUsername !== currentUsername && !canChangeUsername) {
      setError(`You can change your User ID after ${formatDate(nextUsernameChangeAt)}.`)
      setSaving(false)
      return
    }

    try {
      await runTransaction(db, (tx) =>
        updateWithTransaction(tx, nextDisplayName, nextUsername, nextStatus, nextAbout),
      )

      setSuccess('Profile saved successfully.')
      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <section className="profile-page" aria-label="User settings page">
        <div className="settings-shell">
          <div className="settings-main">
            <p className="settings-muted">Loading your profile...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-page" aria-label="User settings page">
      <div className="settings-shell">
        <aside className="settings-sidebar" aria-label="Settings sections">
          <h2>Settings</h2>
          <button
            className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSection('profile')}
          >
            Profile
          </button>
          <button
            className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSection('account')}
          >
            Account
          </button>
        </aside>

        {activeSection === 'profile' ? (
          <div className="settings-main">
            <div className="settings-profile-row">
              <div className="settings-avatar">{(authUser.email || 'U').slice(0, 1).toUpperCase()}</div>
              <div className="settings-avatar-actions">
                <button className="btn btn-primary" type="button" disabled>
                  Change picture
                </button>
                <button className="btn btn-secondary" type="button" disabled>
                  Delete picture
                </button>
              </div>
            </div>

            <label className="settings-label" htmlFor="profile-name">
              Profile name
            </label>
            <input
              id="profile-name"
              className="settings-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />

            <label className="settings-label" htmlFor="profile-username">
              User ID
            </label>
            <div className="settings-username-wrap">
              <span>@</span>
              <input
                id="profile-username"
                className="settings-input settings-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20}
                placeholder="youruserid"
              />
            </div>
            <p className="settings-muted">{usernameHint}</p>

            <label className="settings-label" htmlFor="profile-status">
              Status recently
            </label>
            <input
              id="profile-status"
              className="settings-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={60}
              placeholder="On duty"
            />

            <label className="settings-label" htmlFor="profile-about">
              About me
            </label>
            <textarea
              id="profile-about"
              className="settings-textarea"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={500}
              placeholder="Tell people about yourself"
            />

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-info">{success}</div>}

            <div className="settings-footer">
              <button className="btn btn-primary" type="button" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-main">
            <h3 className="settings-section-title">Account</h3>

            <div className="account-type-card">
              <div className="account-type-top">
                <p className="settings-label">Type of account</p>
                <span className="account-type-badge">Free</span>
              </div>
              <p className="settings-muted">
                You are currently on the Free plan. Paid plans for tests, courses, and language learning materials
                can be added later.
              </p>
            </div>

            <div className="account-upcoming-card">
              <p className="settings-label">Upcoming paid learning features</p>
              <ul className="account-upcoming-list">
                <li>Language skill tests and coding assessments</li>
                <li>Structured courses with milestones</li>
                <li>Premium learning material and practice packs</li>
              </ul>
              <p className="settings-muted">When you enable billing, this page can be connected to subscriptions.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProfilePage
