import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiUpload, FiFile, FiImage, FiX, FiEye, FiDownload } from 'react-icons/fi';
import { MdDescription, MdImage, MdPictureAsPdf } from 'react-icons/md';

const FileModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
`;

const FileContainer = styled(motion.div)`
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-100);
    color: var(--gray-700);
  }
`;

const Title = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-4);
  color: var(--gray-900);
  text-align: center;
`;

const UploadArea = styled(motion.div)`
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--gray-50);
  
  &:hover {
    border-color: var(--primary-blue);
    background: rgba(59, 130, 246, 0.05);
  }
  
  ${props => props.isDragOver && `
    border-color: var(--primary-blue);
    background: rgba(59, 130, 246, 0.1);
  `}
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: var(--gray-400);
  margin-bottom: var(--spacing-4);
`;

const UploadText = styled.div`
  font-size: var(--font-size-lg);
  color: var(--gray-600);
  margin-bottom: var(--spacing-2);
`;

const UploadSubtext = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-500);
`;

const FileInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  margin-top: var(--spacing-6);
`;

const FileItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  border: 1px solid var(--gray-200);
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: var(--primary-blue);
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: var(--spacing-1);
`;

const FileSize = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-500);
`;

const FileActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--gray-500);
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--gray-100);
    color: var(--primary-blue);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--spacing-2);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: var(--primary-blue);
  border-radius: var(--radius-full);
`;

const ErrorMessage = styled.div`
  color: var(--accent-red);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-top: var(--spacing-6);
`;

const Button = styled(motion.button)`
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  ${props => props.variant === 'primary' && `
    background: var(--primary-blue);
    color: white;
    
    &:hover {
      background: var(--secondary-blue);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--gray-100);
    color: var(--gray-700);
    
    &:hover {
      background: var(--gray-200);
      transform: translateY(-2px);
    }
  `}
`;

const FileUpload = ({ onClose, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedTypes = {
    'application/pdf': { icon: <MdPictureAsPdf />, label: 'PDF Document' },
    'image/jpeg': { icon: <MdImage />, label: 'JPEG Image' },
    'image/png': { icon: <MdImage />, label: 'PNG Image' },
    'image/jpg': { icon: <MdImage />, label: 'JPG Image' },
    'text/plain': { icon: <MdDescription />, label: 'Text Document' }
  };

  // Handle file selection
  const handleFileSelect = (selectedFiles) => {
    setError('');
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending'
    }));

    // Validate files
    const validFiles = newFiles.filter(fileInfo => {
      if (!supportedTypes[fileInfo.type]) {
        setError(`Unsupported file type: ${fileInfo.type}`);
        return false;
      }
      if (fileInfo.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File too large: ${fileInfo.name}`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const selectedFiles = e.target.files;
    handleFileSelect(selectedFiles);
  };

  // Remove file
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      // Simulate file upload with progress
      for (const fileInfo of files) {
        await simulateUpload(fileInfo);
      }

      // Process files (OCR, text extraction, etc.)
      const processedFiles = await processFiles(files);
      
      onFileSelect(processedFiles);
      onClose();
    } catch (error) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Simulate upload progress
  const simulateUpload = async (fileInfo) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, progress: Math.min(f.progress + 10, 100) }
            : f
        ));
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, progress: 100, status: 'completed' }
            : f
        ));
        resolve();
      }, 1000);
    });
  };

  // Process files (OCR, text extraction)
  const processFiles = async (files) => {
    // In a real implementation, this would:
    // 1. Extract text from PDFs
    // 2. Perform OCR on images
    // 3. Analyze medical content
    // 4. Return structured data

    return files.map(fileInfo => ({
      ...fileInfo,
      extractedText: `Extracted text from ${fileInfo.name}`,
      medicalData: {
        medications: [],
        symptoms: [],
        diagnoses: [],
        recommendations: []
      }
    }));
  };

  // Get file icon
  const getFileIcon = (type) => {
    return supportedTypes[type]?.icon || <FiFile />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <FileModal
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FileContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
        >
          <CloseButton
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </CloseButton>

          <Title>Upload Medical Documents</Title>

          <UploadArea
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            <UploadText>Drop files here or click to browse</UploadText>
            <UploadSubtext>
              Supports PDF, JPEG, PNG, JPG (Max 10MB each)
            </UploadSubtext>
          </UploadArea>

          <FileInput
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.txt"
            onChange={handleInputChange}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {files.length > 0 && (
            <FileList>
              {files.map((fileInfo) => (
                <FileItem
                  key={fileInfo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FileIcon>
                    {getFileIcon(fileInfo.type)}
                  </FileIcon>
                  
                  <FileInfo>
                    <FileName>{fileInfo.name}</FileName>
                    <FileSize>{formatFileSize(fileInfo.size)}</FileSize>
                    
                    {fileInfo.progress > 0 && (
                      <ProgressBar>
                        <ProgressFill
                          initial={{ width: 0 }}
                          animate={{ width: `${fileInfo.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </ProgressBar>
                    )}
                  </FileInfo>
                  
                  <FileActions>
                    <ActionButton
                      onClick={() => removeFile(fileInfo.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX />
                    </ActionButton>
                  </FileActions>
                </FileItem>
              ))}
            </FileList>
          )}

          <ActionButtons>
            <Button
              variant="secondary"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </ActionButtons>
        </FileContainer>
      </FileModal>
    </AnimatePresence>
  );
};

export default FileUpload;
