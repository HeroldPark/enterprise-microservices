import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attachmentService } from '../services/attachmentService'
import { Download, File, Trash2, Image, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

const AttachmentList = ({ boardId, attachments, canDelete = false }) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (attachmentId) => attachmentService.deleteAttachment(boardId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
    },
  })

  const handleDownload = (attachment) => {
    attachmentService.downloadAttachment(boardId, attachment.id, attachment.originalFileName)
  }

  const handleDelete = (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(attachmentId)
    }
  }

  const getFileIcon = (contentType) => {
    if (contentType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />
    }
    if (contentType.includes('pdf') || contentType.includes('document')) {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
  }

  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Attachments ({attachments.length})
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <motion.div
            key={attachment.id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center space-x-3 flex-1">
              {getFileIcon(attachment.contentType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.originalFileName}
                </p>
                <p className="text-xs text-gray-500">
                  {attachmentService.formatFileSize(attachment.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handleDownload(attachment)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </motion.button>

              {canDelete && (
                <motion.button
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AttachmentList
