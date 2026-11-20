// GraphQL documents for the v3 API. The mock ignores selection sets but a real server would not.
const image = `{ url metadata { width height type size } }`
const avatar = `{ small ${image} regular ${image} large ${image} original ${image} }`
const responsive = `{ xhdpi ${image} hdpi ${image} mdpi ${image} ldpi ${image} optimized ${image} original ${image} video ${image} }`

const authorFields = `
  id username name
  avatar ${avatar}
  currentUserState { relationshipPriority }
`

const submissionFields = `id status artistInvite { id slug title }`
const submissionActionFields = `href label method body { status }`
/** Post detail also asks for the curator's actions (the original's `fullPost` fragment). */
const detailSubmission = `artistInviteSubmission { ${submissionFields} actions { approve { ${submissionActionFields} } decline { ${submissionActionFields} } select { ${submissionActionFields} } unapprove { ${submissionActionFields} } unselect { ${submissionActionFields} } } }`

const regionFields = `kind data linkUrl links { assets }`

/** `sourceExtra` adds fields to the reposted original (notifications summarize it). */
const buildPostFields = (sourceExtra = '', submission = `artistInviteSubmission { ${submissionFields} }`) => `
  id token createdAt contentWarning
  ${submission}
  author { ${authorFields} }
  summary { ${regionFields} }
  content { ${regionFields} }
  repostContent { ${regionFields} }
  repostedSource { id token author { ${authorFields} } artistInviteSubmission { ${submissionFields} } ${sourceExtra} }
  categoryPosts { id status featuredBy { username } submittedBy { username } actions { feature { method href } unfeature { method href } } category { id slug name } }
  assets { id attachment ${responsive} }
  postStats { lovesCount commentsCount viewsCount repostsCount }
  currentUserState { watching loved reposted }
`

export const postFields = buildPostFields()
const detailPostFields = buildPostFields('', detailSubmission)
/** For notifications: the original of a repost also carries its summary and images. */
export const postFieldsWithSource = buildPostFields(`summary { ${regionFields} } assets { id attachment ${responsive} }`)

const stream = (field: string, args: string, vars: string) => `
  query(${vars}) {
    ${field}(${args}) { next isLastPage posts { ${postFields} } }
  }
`

export const GLOBAL_STREAM = stream('globalPostStream', 'kind: $kind, before: $before', '$kind: StreamKind!, $before: String')
export const FOLLOWING_STREAM = stream('followingPostStream', 'kind: $kind, before: $before', '$kind: StreamKind!, $before: String')
export const CATEGORY_STREAM = stream('categoryPostStream', 'slug: $slug, kind: $kind, before: $before', '$slug: String!, $kind: StreamKind!, $before: String')
export const SEARCH_POSTS = stream('searchPosts', 'query: $query, perPage: $perPage, before: $before', '$query: String!, $perPage: Int!, $before: String')
export const USER_STREAM = stream('userPostStream', 'username: $username, before: $before', '$username: String!, $before: String')

export const USER_LOVES = `
  query($username: String!, $before: String) {
    userLoveStream(username: $username, before: $before) { next isLastPage loves { id post { ${postFields} } } }
  }
`

export const FIND_POST = `
  query($username: String!, $token: String!) { post(username: $username, token: $token) { ${detailPostFields} } }
`

export const COMMENTS = `
  query($id: String, $perPage: String, $before: String) {
    commentStream(id: $id, perPage: $perPage, before: $before) {
      next isLastPage
      comments { id createdAt author { ${authorFields} } content { ${regionFields} } assets { id attachment ${responsive} } parentPost { id } }
    }
  }
`

export const FIND_USER = `
  query($username: String!) {
    findUser(username: $username) {
      ${authorFields}
      location formattedShortBio
      coverImage ${responsive}
      externalLinksList { url text }
      settings { isHireable isCollaborateable }
      categoryUsers { id role category { id name slug } }
      userStats { followersCount followingCount lovesCount postsCount totalViewsCount }
    }
  }
`

export const SEARCH_USERS = `
  query($query: String!) {
    searchUsers(query: $query, perPage: 10) { users { ${authorFields} formattedShortBio } }
  }
`

export const CATEGORIES = `query { allCategories { id name slug level description tileImage ${avatar} } }`
export const CATEGORY_NAV = `query { categoryNav { id name slug level tileImage ${avatar} } }`

export const PAGE_HEADERS = `
  query($kind: PageHeaderKind!, $slug: String) {
    pageHeaders(kind: $kind, slug: $slug) {
      id kind header subheader image ${responsive}
      ctaLink { text url }
      user { ${authorFields} }
    }
  }
`

export const EDITORIALS = `
  query($before: String) {
    editorialStream(before: $before) {
      next isLastPage
      editorials {
        id kind title subtitle path url
        oneByOneImage ${responsive} twoByOneImage ${responsive} twoByTwoImage ${responsive}
        post { ${postFields} }
      }
    }
  }
`

/** The original's `categoryDetailsQuery`: a category with its curators and moderators. */
export const CATEGORY_DETAILS = `
  query($slug: String!, $roles: [CategoryUserRole]) {
    category(slug: $slug) {
      id name slug description
      brandAccount { ${authorFields} }
      categoryUsers(roles: $roles) { id role user { ${authorFields} } }
    }
  }
`

/** The original's `userQuickSearchQuery` (the user picker of the add-role dialog). */
export const USER_QUICK_SEARCH = `
  query($query: String!) {
    searchUsers(query: $query, perPage: 10) { users { id username avatar { small { url } } } }
  }
`

/** The original's `searchCategories` query as the profile's Community Roles form sends it (`administered: true`). */
export const ADMINISTERED_CATEGORIES = `
  query($query: String, $administered: Boolean) {
    searchCategories(query: $query, administered: $administered) {
      categories { id name slug currentUserState { role } }
    }
  }
`
