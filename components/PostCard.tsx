"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from "@mui/material"
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from "@mui/icons-material"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface Author {
  id: string
  name: string | null
  email: string
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: Author
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
}

export default function PostCard({ 
  post, 
  currentUserId, 
  onEdit, 
  onDelete 
}: PostCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    if (onEdit) onEdit(post)
    handleMenuClose()
  }

  const handleDelete = () => {
    if (onDelete) onDelete(post.id)
    handleMenuClose()
  }

  const isAuthor = currentUserId === post.author.id
  const createdAt = new Date(post.createdAt)
  const updatedAt = new Date(post.updatedAt)
  const isEdited = createdAt.getTime() !== updatedAt.getTime()

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 2,
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1, pr: 2 }}>
            {post.title}
          </Typography>
          {isAuthor && (
            <IconButton
              aria-label="post-menu"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {post.content}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {post.author.name || post.author.email}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: ja })}
          </Typography>

          {isEdited && (
            <Chip
              label="編集済み"
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: "20px" }}
            />
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          編集
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          削除
        </MenuItem>
      </Menu>
    </Card>
  )
}