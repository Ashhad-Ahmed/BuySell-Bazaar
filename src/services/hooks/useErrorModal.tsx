import React, { useState, useCallback } from 'react';

export const useErrorModal = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode | null>(null);

  const showError = useCallback((text: string, iconNode?: React.ReactNode) => {
    setMessage(text);
    if (iconNode) setIcon(iconNode);
    setVisible(true);
  }, []);

  const hideError = useCallback(() => setVisible(false), []);

  return { visible, message, icon, showError, hideError };
};
