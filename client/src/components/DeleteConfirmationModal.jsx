import React from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  X,
  Trash2,
  User,
  Building2,
  Loader,
} from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = "employee", // 'employee' or 'department'
  itemName = "",
  itemId = null,
  isLoading = false,
  additionalInfo = null,
  warningMessage = "",
}) => {
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (itemType) {
      case "employee":
        return <User className="w-12 h-12 text-red-600" />;
      case "department":
        return <Building2 className="w-12 h-12 text-red-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (itemType) {
      case "employee":
        return "Delete Employee";
      case "department":
        return "Delete Department";
      default:
        return "Delete Item";
    }
  };

  const getDefaultWarning = () => {
    switch (itemType) {
      case "employee":
        return `This action will permanently delete ${itemName}'s record, including all associated data, documents, and history.`;
      case "department":
        return `This action will permanently delete the ${itemName} department. Employees in this department will need to be reassigned.`;
      default:
        return `This action will permanently delete ${itemName}. This cannot be undone.`;
    }
  };

  const getConfirmationText = () => {
    switch (itemType) {
      case "employee":
        return `Are you sure you want to delete employee "${itemName}"?`;
      case "department":
        return `Are you sure you want to delete department "${itemName}"?`;
      default:
        return `Are you sure you want to delete "${itemName}"?`;
    }
  };

  const displayWarning = warningMessage || getDefaultWarning();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-out"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-300 ease-out animate-in fade-in zoom-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3 animate-pulse">
                {getIcon()}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {getTitle()}
            </h3>

            {/* Confirmation Text */}
            <p className="text-gray-600 text-center mb-3">
              {getConfirmationText()}
            </p>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Warning!</p>
                  <p>{displayWarning}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {additionalInfo && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <p className="text-gray-600">{additionalInfo}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {itemType === "employee" ? "Employee" : "Department"}
                  </>
                )}
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-400 text-center mt-4">
              This action cannot be undone. All associated data will be
              permanently removed.
            </p>
          </div>
        </div>
      </div>

      {/* Add animation styles if not already present */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }

        .fade-in {
          animation-name: fadeIn;
        }

        .zoom-in {
          animation-name: zoomIn;
        }
      `}</style>
    </div>
  );
};

// Custom hook for using delete confirmation
export const useDeleteConfirmation = () => {
  const [deleteState, setDeleteState] = React.useState({
    isOpen: false,
    itemType: "employee",
    itemName: "",
    itemId: null,
    additionalInfo: null,
    onConfirmCallback: null,
  });

  const showDeleteConfirmation = ({
    itemType,
    itemName,
    itemId,
    additionalInfo = null,
    onConfirm,
    warningMessage = "",
  }) => {
    setDeleteState({
      isOpen: true,
      itemType,
      itemName,
      itemId,
      additionalInfo,
      warningMessage,
      onConfirmCallback: onConfirm,
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteState({
      isOpen: false,
      itemType: "employee",
      itemName: "",
      itemId: null,
      additionalInfo: null,
      onConfirmCallback: null,
      warningMessage: "",
    });
  };

  const DeleteModalComponent = () => (
    <DeleteConfirmationModal
      isOpen={deleteState.isOpen}
      onClose={hideDeleteConfirmation}
      onConfirm={async () => {
        if (deleteState.onConfirmCallback) {
          await deleteState.onConfirmCallback(deleteState.itemId);
        }
        hideDeleteConfirmation();
      }}
      itemType={deleteState.itemType}
      itemName={deleteState.itemName}
      itemId={deleteState.itemId}
      additionalInfo={deleteState.additionalInfo}
      warningMessage={deleteState.warningMessage}
    />
  );

  return {
    showDeleteConfirmation,
    hideDeleteConfirmation,
    DeleteModalComponent,
  };
};

export default DeleteConfirmationModal;
