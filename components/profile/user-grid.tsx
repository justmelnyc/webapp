import { UserCard, type UserCardData } from '@/components/profile/user-card'
import styles from './user-card.module.css'

/** The original's `Users.asGrid` inside a `StreamContainer` (10 / 20 / 40px wrapper padding). */
export const UserGrid = ({ users, signedIn }: { users: UserCardData[]; signedIn: boolean }) => (
  <section className={styles.container}>
    <div className={`Users asGrid ${styles.grid}`}>
      {users.map((user) => (
        <UserCard key={user.id} user={user} signedIn={signedIn} />
      ))}
    </div>
  </section>
)
