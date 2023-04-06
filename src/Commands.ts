import Hello from '@/commands/hello';
import { Command } from '@/types/Command';
import Poll from './commands/poll';

const Commands: Command[] = [Hello, Poll];

export { Commands };
