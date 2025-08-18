import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'danger', // danger, warning, info, success
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  const getIcon = () => {
    const iconClass = "h-6 w-6";
    switch (type) {
      case 'danger': return <TrashIcon className={`${iconClass} text-destructive`} />;
      case 'warning': return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'success': return <CheckIcon className={`${iconClass} text-green-500`} />;
      case 'info': return <PencilIcon className={`${iconClass} text-primary`} />;
      default: return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getConfirmVariant = () => {
    switch (type) {
      case 'danger': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onHide} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
