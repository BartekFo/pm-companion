'use client';
import cx from 'classnames';
import type React from 'react';
import { useRef, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Send, Square } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  setMessages,
  handleSubmit,
  className,
  projectId,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
  projectId?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  // Determine endpoints based on project context
  const chatUrlBase = projectId ? `/${projectId}/chat` : '/chat';
  const uploadEndpoint = projectId
    ? `/${projectId}/chat/api/files/upload`
    : '/chat/api/files/upload';

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once after hydration
  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetHeight is changing on every render
  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `${chatUrlBase}/${chatId}`);

    handleSubmit(undefined);

    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [handleSubmit, setLocalStorageInput, width, chatId, chatUrlBase]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Ask question..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-40 max-h-v[calc(75dvh)] overflow-hidden resize-none rounded-xl text-base! bg-neutral-0/90 pb-18 border-neutral-200 shadow-1 dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 right-0 p-3 w-full flex flex-col items-end gap-3">
        <div className="h-px bg-neutral-100 w-full" />
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton input={input} submitForm={submitForm} />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;

    return true;
  },
);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <Square className="size-3.5" />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
}: {
  submitForm: () => void;
  input: string;
}) {
  return (
    <Button
      data-testid="send-button"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      className="w-fit"
      disabled={input.length === 0}
    >
      <Send className="h-3.5 w-3.5" />
      Send
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
