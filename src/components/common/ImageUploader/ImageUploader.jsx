/**
 * ImageUploader Component — ReTruck MVP
 *
 * Reusable image upload component with:
 *  - Drag and drop support
 *  - File type validation (JPG, JPEG, PNG, WebP only)
 *  - File size validation (max 1 MB)
 *  - Live image preview
 *  - Category-based folder routing
 *
 * Props:
 *  - category: 'profile-picture' | 'truck-photo' | 'kyc-document'
 *  - currentImage: string (current image URL to show as initial preview)
 *  - onUpload: function({ previewUrl, fileName, savePath, file }) => void
 *  - label: string (optional, displayed above the zone)
 *  - variant: 'default' | 'compact' (layout style)
 *  - previewShape: 'rectangle' | 'avatar' | 'document'
 *  - userId: string (used for file naming)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { processImageUpload, revokePreviewUrl, ALLOWED_EXTENSIONS } from '../../../services/imageUploadService.js';
import './ImageUploader.css';

function ImageUploader({
  category,
  currentImage,
  onUpload,
  label,
  variant,
  previewShape,
  userId
}) {
  var resolvedVariant = variant || 'default';
  var resolvedShape = previewShape || 'rectangle';

  var [previewUrl, setPreviewUrl] = useState(currentImage || null);
  var [isDragging, setIsDragging] = useState(false);
  var [error, setError] = useState(null);
  var [successName, setSuccessName] = useState(null);
  var inputRef = useRef(null);
  var prevBlobRef = useRef(null);

  // If parent changes currentImage (e.g. reset), update preview
  useEffect(function () {
    if (currentImage && currentImage !== previewUrl) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  // Cleanup blob URLs on unmount
  useEffect(function () {
    return function () {
      if (prevBlobRef.current) {
        revokePreviewUrl(prevBlobRef.current);
      }
    };
  }, []);

  function handleFile(file) {
    setError(null);
    setSuccessName(null);

    var result = processImageUpload(file, category, userId || 'user');

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Revoke old blob URL
    if (prevBlobRef.current) {
      revokePreviewUrl(prevBlobRef.current);
    }
    prevBlobRef.current = result.previewUrl;

    setPreviewUrl(result.previewUrl);
    setSuccessName(file.name);

    if (onUpload) {
      onUpload({
        previewUrl: result.previewUrl,
        fileName: result.fileName,
        savePath: result.savePath,
        file: file
      });
    }
  }

  function handleInputChange(e) {
    var file = e.target.files && e.target.files[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleZoneClick(e) {
    // Don't trigger file dialog if clicking the "Change" button inside
    if (e.target.closest('.img-uploader__preview-change')) return;
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  function handleClear(e) {
    e.stopPropagation();
    if (prevBlobRef.current) {
      revokePreviewUrl(prevBlobRef.current);
      prevBlobRef.current = null;
    }
    setPreviewUrl(currentImage || null);
    setSuccessName(null);
    setError(null);
  }

  var zoneClass = 'img-uploader__zone'
    + (isDragging ? ' img-uploader__zone--dragging' : '')
    + (error ? ' img-uploader__zone--error' : '')
    + (successName ? ' img-uploader__zone--success' : '');

  var previewImgClass = 'img-uploader__preview-img'
    + (resolvedShape === 'avatar' ? ' img-uploader__preview-img--avatar' : '')
    + (resolvedShape === 'document' ? ' img-uploader__preview-img--doc' : '');

  return (
    <div className={'img-uploader' + (resolvedVariant === 'compact' ? ' img-uploader--compact' : '')}>
      {label && (
        <span className="img-uploader__label-text">{label}</span>
      )}

      <div
        className={zoneClass}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        aria-label="Upload image — click or drag a file here"
        onKeyDown={function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (inputRef.current) inputRef.current.click();
          }
        }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="img-uploader__input"
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {previewUrl ? (
          /* ── Preview State ── */
          <div className="img-uploader__preview-wrap">
            <img
              src={previewUrl}
              alt="Upload preview"
              className={previewImgClass}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {successName && (
                <span className="img-uploader__preview-name">
                  <CheckCircle size={13} />
                  {successName.length > 28 ? successName.substring(0, 25) + '...' : successName}
                </span>
              )}
              <button
                type="button"
                className="img-uploader__preview-change"
                onClick={function (e) {
                  e.stopPropagation();
                  if (inputRef.current) inputRef.current.click();
                }}
                aria-label="Change image"
              >
                Change
              </button>
              {successName && (
                <button
                  type="button"
                  className="img-uploader__preview-change"
                  onClick={handleClear}
                  aria-label="Remove image"
                  style={{ color: '#EF4444' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Empty / Placeholder State ── */
          <div className="img-uploader__placeholder">
            <div className="img-uploader__icon">
              {isDragging ? <Upload size={20} /> : <Image size={20} />}
            </div>
            <span className="img-uploader__main-text">
              {isDragging ? 'Drop it here!' : 'Click or drag & drop'}
            </span>
            <span className="img-uploader__sub-text">
              {ALLOWED_EXTENSIONS.join(', ')} · Max 1 MB
            </span>
          </div>
        )}
      </div>

      {/* Rules hint */}
      <div className="img-uploader__rules">
        <Info size={13} />
        Accepted: {ALLOWED_EXTENSIONS.join(', ')} &nbsp;·&nbsp; Max size: 1 MB
      </div>

      {/* Error message */}
      {error && (
        <div className="img-uploader__error" role="alert">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Success message */}
      {successName && !error && (
        <div className="img-uploader__success" role="status">
          <CheckCircle size={14} />
          File uploaded successfully and ready for save.
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
