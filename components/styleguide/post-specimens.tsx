'use client'

import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCredits, HeroCreditsCollapsed } from '@/components/heroes/hero-credits'
import { ArrowIcon, BubbleIcon, CheckCircleIcon, DragIcon, EyeIcon, HeartIcon, PlusCircleIcon, RepostIcon, ShareIcon, XIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import parts from '@/components/ui/editor-parts.module.css'
import type { Author } from '@/types/user'
import { cn } from '@/utils/cn'
import promotion from '@/components/heroes/hero-promotion.module.css'
import { GreyStage, Inline, Specimen, Stage, Variant } from './specimen'
import styles from './post-specimens.module.css'
import '@/components/posts/post-tools.css'
import '@/components/posts/post-hints.css'
import '@/components/streams/columns.css'

const Tools = ({ signedIn }: { signedIn: boolean }) => (
  <footer className="PostTools">
    <span className={cn('PostTool ViewsTool', signedIn && 'isPill')}>
      <a href="#post-pieces">
        <EyeIcon />
        <span className="PostToolValue">120</span>
        <Hint>Views</Hint>
      </a>
    </span>
    <span className="PostTool CommentTool" data-count={2}>
      <button type="button" className="isNotZero">
        <BubbleIcon />
        <span className="PostToolValue">2</span>
        <Hint>Comment</Hint>
      </button>
    </span>
    <span className="PostTool LoveTool" data-count={1}>
      <button type="button" className="hasPostToolDrawer">
        <HeartIcon />
        <Hint>Love</Hint>
      </button>
      <button type="button" className="PostToolDrawerButton">
        <span className="PostToolValue">1</span>
      </button>
    </span>
    <span className="PostTool RepostTool" data-count={0}>
      <button type="button">
        <RepostIcon />
        <Hint>Repost</Hint>
      </button>
    </span>
    <span className={cn('PostTool ShareTool', !signedIn && 'isPill')}>
      <button type="button">
        <ShareIcon />
        <Hint>Share</Hint>
      </button>
    </span>
  </footer>
)

const FollowToggle = ({ following }: { following: boolean }) => (
  <div className="RelationshipContainer isInHeader">
    <button type="button" className="FollowButton isInHeader" data-priority={following ? 'friend' : 'inactive'}>
      {following ? <CheckCircleIcon /> : <PlusCircleIcon />}
      <span className="FollowButtonLabel">{following ? 'Following' : 'Follow'}</span>
    </button>
  </div>
)

/** The shared pieces of posts, comments, editors and heroes that are global class names or CSS, not components/ui primitives. */
export const PostSpecimens = ({ avatarUrl }: { avatarUrl: string }) => {
  const user: Author = { id: '0', username: 'somebody', name: 'Somebody', avatar: { regular: { url: avatarUrl } } }
  return (
    <>
      <Specimen name=".PostTools, .PostTool, Hint" about="One tool of a post or comment footer (components/posts/post-tools.css): a 20px line holding a link or button in grey that turns black on hover, its value 5px after the icon. Hint (components/posts/hint) is the black label that fades in above a hovered tool. The post page and the comment tools use these same rules and only add what differs.">
        <Variant label="Signed in: Views is a grey pill">
          <Stage className={styles.toolStage}>
            <Tools signedIn />
          </Stage>
        </Variant>
        <Variant label="Signed out: Share is the pill (its Hint is the label)">
          <Stage className={styles.toolStage}>
            <Tools signedIn={false} />
          </Stage>
        </Variant>
      </Specimen>
      <Specimen name=".FollowButton.isInHeader" about="The follow toggle of a post header (components/posts/post-hints.css): a 20px circle icon, a grey disc with a check once followed; from 40em its .FollowButtonLabel shows above it on hover. Streams (PostFollowButton) and the post page (RelationshipButton) draw the same button.">
        <Variant label="Follow, Following">
          <Stage className={styles.toolStage}>
            <Inline>
              <FollowToggle following={false} />
              <FollowToggle following />
            </Inline>
          </Stage>
        </Variant>
      </Specimen>
      <Specimen name="editor-parts.module.css" about="What every editor shares (components/ui/editor-parts.module.css): placeholder (read from data-placeholder), the region tools with remove and the drag handle (hover devices only), and the busy cover over a picture that is uploading. The omnibar, the inline post editor and the comment editor add only their own offsets.">
        <Variant label="placeholder, tools, remove, drag">
          <GreyStage className={styles.editorStage}>
            <span data-placeholder="Comment..." className={cn(styles.placeholderHost, parts.placeholder)} />
            <div className={parts.tools}>
              <button type="button" aria-label="Remove" className={parts.remove}>
                <XIcon />
              </button>
              <button type="button" aria-label="Reorder" className={parts.drag}>
                <DragIcon />
              </button>
            </div>
          </GreyStage>
        </Variant>
        <Variant label="busy, busyArrow">
          <GreyStage className={styles.busyStage}>
            <div className={parts.busy} role="status" aria-label="Uploading">
              <div className={parts.busyArrow}>
                <ArrowIcon isAnimated />
              </div>
            </div>
          </GreyStage>
        </Variant>
      </Specimen>
      <Specimen name="hero-promotion.module.css, HeroCredits" about="The frame of a hero promotion (components/heroes/hero-promotion.module.css: 240px tall, 380px from 40em, white text over a picture) and the credit in its bottom right corner (components/heroes/hero-credits): HeroCredits with the name, HeroCreditsCollapsed with only the avatar.">
        <Variant label="HeroCredits with a label">
          <div className={promotion.promotion}>
            <BackgroundImage src={avatarUrl} overlay={4} />
            <HeroCredits user={user} label="Posted by" />
          </div>
        </Variant>
        <Variant label="HeroCreditsCollapsed">
          <div className={promotion.promotion}>
            <BackgroundImage src={avatarUrl} overlay={4} />
            <HeroCreditsCollapsed user={user} />
          </div>
        </Variant>
      </Specimen>
      <Specimen name=".Columns, .Column" about="The column grid (components/streams/columns.css): two columns, three from 60em, four from 85em and one more at each wider breakpoint, 20px apart (40px from 85em). Streams (.Posts.asGrid), related posts and the invitations grid use it.">
        <Variant label="Columns of the page width">
          <Stage>
            <div className="Columns">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="Column">
                  <div className={styles.cell}>{n}</div>
                </div>
              ))}
            </div>
          </Stage>
        </Variant>
      </Specimen>
    </>
  )
}
