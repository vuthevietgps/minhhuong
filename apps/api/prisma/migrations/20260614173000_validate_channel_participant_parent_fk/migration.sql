-- Prompt 10: local data-quality audit found no missing, self-parented, or
-- cyclic ChannelParticipant parent references. Validate the self-FK so the
-- deploy schema no longer leaves the constraint NOT VALID.

ALTER TABLE "ChannelParticipant"
VALIDATE CONSTRAINT "ChannelParticipant_parentParticipantId_fkey";
