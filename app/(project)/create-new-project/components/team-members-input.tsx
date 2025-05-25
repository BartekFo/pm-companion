'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { z } from 'zod/v4-mini';

const emailSchema = z.email({ error: 'Please enter a valid email address' });

interface TeamMembersInputProps {
  defaultValue?: string;
}

export function TeamMembersInput({ defaultValue = '' }: TeamMembersInputProps) {
  const [email, setEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Initialize with default value
  useEffect(() => {
    if (defaultValue) {
      const emails = defaultValue
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean);
      setTeamMembers(emails);
    }
  }, [defaultValue]);

  const handleAdd = () => {
    const trimmedEmail = email.trim();

    const result = emailSchema.safeParse(trimmedEmail);

    console.log(result);

    if (!result.success) {
      setError(z.prettifyError(result.error));
      return;
    }

    if (teamMembers.includes(trimmedEmail)) {
      setError('This email is already added');
      return;
    }

    setTeamMembers([...teamMembers, trimmedEmail]);
    setEmail('');
    setError('');
  };

  const handleRemove = (member: string) => {
    setTeamMembers(teamMembers.filter((m) => m !== member));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="space-y-2">
      <Label>Team members</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Email"
            value={email}
            type="email"
            onChange={handleEmailChange}
            onKeyDown={handleKeyPress}
            className={error ? 'border-red-500 focus:border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <input type="hidden" name="teamMembers" value={teamMembers.join(',')} />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <AnimatePresence>
        {teamMembers.length > 0 && (
          <motion.div
            className="flex gap-2 flex-wrap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  className="px-4 py-2 rounded-full border-primary-300 cursor-pointer"
                  onClick={() => handleRemove(member)}
                  variant="outline"
                >
                  {member.split('@')[0]}
                  <XIcon className="w-4 h-4 text-primary-500 ml-1" />
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
