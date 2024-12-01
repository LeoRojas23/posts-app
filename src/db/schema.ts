import { relations, sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'
import { AdapterAccountType } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  username: text('username').unique(),
  createdAt: text('created_at')
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  verificationToken => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
)

export const authenticators = sqliteTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: integer('credentialBackedUp', {
      mode: 'boolean',
    }).notNull(),
    transports: text('transports'),
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
)

export const userRelations = relations(users, ({ many }) => ({
  posts: many(postTable),
  postLike: many(postLikeTable),
  comments: many(commentTable),
  following: many(followTable, { relationName: 'following' }),
  followers: many(followTable, { relationName: 'followers' }),
}))

export const followTable = sqliteTable(
  'follow',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: text('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  t => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  }),
)

export const followRelations = relations(followTable, ({ one }) => ({
  follower: one(users, {
    fields: [followTable.followerId],
    references: [users.id],
    relationName: 'followers',
  }),
  followee: one(users, {
    fields: [followTable.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}))

export const postTable = sqliteTable('post', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  text: text('text'),
  image: text('image').default(sql`NULL`),
  createdAt: text('created_at')
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const postRelations = relations(postTable, ({ one, many }) => ({
  author: one(users, {
    fields: [postTable.authorId],
    references: [users.id],
  }),
  postLike: many(postLikeTable),
  comments: many(commentTable),
}))

export const postLikeTable = sqliteTable(
  'post_like',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id')
      .notNull()
      .references(() => postTable.id, { onDelete: 'cascade' }),
    createdAt: text('created_at')
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  t => ({
    pk: primaryKey({ columns: [t.userId, t.postId] }),
  }),
)

export const postLikeRelations = relations(postLikeTable, ({ one }) => ({
  post: one(postTable, {
    fields: [postLikeTable.postId],
    references: [postTable.id],
  }),
  user: one(users, {
    fields: [postLikeTable.userId],
    references: [users.id],
  }),
}))

export const commentTable = sqliteTable('comment', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  text: text('text', { length: 280 }).notNull(),
  createdAt: text('created_at')
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id')
    .notNull()
    .references(() => postTable.id, { onDelete: 'cascade' }),
  parentId: text('parent_id')
    .default(sql`NULL`)
    .references((): AnySQLiteColumn => commentTable.id, { onDelete: 'cascade' }),
})

export const commentRelations = relations(commentTable, ({ one, many }) => ({
  author: one(users, {
    fields: [commentTable.authorId],
    references: [users.id],
  }),
  commentLikes: many(commentLikeTable),
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.id],
  }),
  parent: one(commentTable, {
    fields: [commentTable.parentId],
    references: [commentTable.id],
    relationName: 'commentParent',
  }),
  children: many(commentTable, { relationName: 'commentParent' }),
}))

export const commentLikeTable = sqliteTable(
  'comment_like',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: text('comment_id')
      .notNull()
      .references(() => commentTable.id, { onDelete: 'cascade' }),
    createdAt: text('created_at')
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  t => ({
    pk: primaryKey({ columns: [t.userId, t.commentId] }),
  }),
)

export const commentLikeRelations = relations(commentLikeTable, ({ one }) => ({
  comment: one(commentTable, {
    fields: [commentLikeTable.commentId],
    references: [commentTable.id],
  }),
  user: one(users, {
    fields: [commentLikeTable.userId],
    references: [users.id],
  }),
}))
