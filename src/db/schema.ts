import { relations, sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'

export const userTable = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  username: text('username').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
})

export const accountTable = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verificationTable = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const userRelations = relations(userTable, ({ many }) => ({
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
      .references(() => userTable.id, { onDelete: 'cascade' }),
    followingId: text('following_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
  },
  t => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  }),
)

export const followRelations = relations(followTable, ({ one }) => ({
  follower: one(userTable, {
    fields: [followTable.followerId],
    references: [userTable.id],
    relationName: 'followers',
  }),
  followee: one(userTable, {
    fields: [followTable.followingId],
    references: [userTable.id],
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
    .references(() => userTable.id, { onDelete: 'cascade' }),
})

export const postRelations = relations(postTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [postTable.authorId],
    references: [userTable.id],
  }),
  postLike: many(postLikeTable),
  comments: many(commentTable),
}))

export const postLikeTable = sqliteTable(
  'post_like',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
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
  user: one(userTable, {
    fields: [postLikeTable.userId],
    references: [userTable.id],
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
    .references(() => userTable.id, { onDelete: 'cascade' }),
  postId: text('post_id')
    .notNull()
    .references(() => postTable.id, { onDelete: 'cascade' }),
  parentId: text('parent_id')
    .default(sql`NULL`)
    .references((): AnySQLiteColumn => commentTable.id, { onDelete: 'cascade' }),
})

export const commentRelations = relations(commentTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [commentTable.authorId],
    references: [userTable.id],
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
      .references(() => userTable.id, { onDelete: 'cascade' }),
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
  user: one(userTable, {
    fields: [commentLikeTable.userId],
    references: [userTable.id],
  }),
}))
