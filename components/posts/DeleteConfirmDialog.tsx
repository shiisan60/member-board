'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '投稿を削除しますか？',
  message = 'この操作は取り消すことができません。本当に削除してもよろしいですか？'
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          キャンセル
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          削除する
        </Button>
      </DialogActions>
    </Dialog>
  );
}