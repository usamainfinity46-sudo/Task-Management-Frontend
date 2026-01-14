import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // danger, warning, info
    isLoading = false,
}) => {
    const getIcon = () => {
        if (type === 'danger') return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
        if (type === 'warning') return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    };

    const getButtonVariant = () => {
        if (type === 'danger') return 'danger';
        if (type === 'warning') return 'primary'; // or warning if available, but primary (blue) is usually fine, or maybe orange
        return 'primary';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" showCloseButton={false}>
            <div className="flex items-start space-x-4 mt-2">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-500">
                        {message}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={getButtonVariant()}
                    onClick={onConfirm}
                    loading={isLoading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmationDialog;
