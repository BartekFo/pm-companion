import { motion } from 'motion/react';
import { Heading1, Heading3, LeadText } from './typography';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-4xl space-y-4 mx-auto md:mt-40 px-8 flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        <Heading3 className="text-center">Hi 👋🏻</Heading3>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        <Heading1 className="text-center">
          What would you like to know?
        </Heading1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        <LeadText className="text-center">
          Ask about business requirements, priorities, or open questions. <br />
          I’m here to help you stay on top of it all.
        </LeadText>
      </motion.div>
    </div>
  );
};
