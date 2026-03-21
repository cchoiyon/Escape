import { VFSDirectory } from './types';

export const getLevelVFS = (level: number): VFSDirectory => {
  switch (level) {
    case 1:
      return {
        type: 'dir',
        contents: {
          'farm_logs.txt': {
            type: 'file',
            content: 'Day 1: Planted parsnips.\nDay 2: Watered crops. Found a locked portal.\nDay 3: Need to find a way to open the portal.',
            permissions: 'rw-r--r--'
          },
          'portal_config.conf': {
            type: 'file',
            content: 'PORTAL_STATUS=LOCKED\nEMERGENCY_OVERRIDE_CMD=sudo unlock',
            permissions: 'rw-r--r--'
          }
        }
      };
    case 2:
      return {
        type: 'dir',
        contents: {
          'security_scripts': {
            type: 'dir',
            contents: {
              'disable_robots.sh': {
                type: 'file',
                content: '#!/bin/bash\necho "Disabling robots..."\nsystemctl stop robot-patrol',
                permissions: 'rwxr-xr-x'
              },
              'robot_logs.txt': {
                type: 'file',
                content: 'WARNING: Security robots activated.\nTo disable, run the disable script with sudo.',
                permissions: 'rw-r--r--'
              },
              'security_logs.txt': {
                type: 'file',
                content: 'LOG_START\n' + 'system_check_ok\n'.repeat(50) + 'ACCESS_CODE: 4291\n' + 'system_check_ok\n'.repeat(50),
                permissions: 'rw-r--r--'
              }
            }
          }
        }
      };
    case 3:
      return {
        type: 'dir',
        contents: {
          '.secret_override.sys': {
            type: 'file',
            content: 'SYSTEM_OVERRIDE_PROTOCOL_V3.1\n' + 'junk_data_'.repeat(100) + '\npasscode: activate_portal 8891\n' + 'junk_data_'.repeat(100),
            permissions: 'rw-------',
            hidden: true
          },
          'log1.txt': { type: 'file', content: 'Nothing here.', permissions: 'rw-r--r--' },
          'log2.txt': { type: 'file', content: 'Just more logs.', permissions: 'rw-r--r--' },
          'log3.txt': { type: 'file', content: 'Still nothing.', permissions: 'rw-r--r--' }
        }
      };
    case 4:
      return {
        type: 'dir',
        contents: {
          'extend_bridge.sh': {
            type: 'file',
            content: '#!/bin/bash\necho "Extending bridge..."\nbridge_control --extend',
            permissions: 'rw-r--r--'
          },
          'bridge_manual.txt': {
            type: 'file',
            content: 'To extend the bridge, execute extend_bridge.sh.\nYou may need to update permissions first.',
            permissions: 'rw-r--r--'
          }
        }
      };
    case 5:
      return {
        type: 'dir',
        contents: {
          'portal.conf': {
            type: 'file',
            content: 'ERROR: CORRUPTED DATA\n@!#$%^&*()',
            permissions: 'rw-r--r--'
          },
          'portal.conf.bak': {
            type: 'file',
            content: 'PORTAL_STATUS=READY\nRESTORATION_CMD=sudo systemctl restart portal',
            permissions: 'rw-r--r--'
          }
        }
      };
    default:
      return { type: 'dir', contents: {} };
  }
};
