import os
import sys
import ctypes
from ctypes import wintypes
import time

def start():
    sdk_root = os.path.expandvars(r"%USERPROFILE%\AppData\Local\Android\Sdk")
    emu_dir = os.path.join(sdk_root, "emulator")
    emu_exe = os.path.join(emu_dir, "emulator.exe")
    log_file = r"c:\Users\disha\Documents\CODES\studio\carSOUNDMOD\emulator_desktop_log.txt"

    # Let's run it through cmd.exe redirecting output to log_file
    cmd_line = f'cmd.exe /c ""{emu_exe}" -avd medium_tablet > "{log_file}" 2>&1"'

    class STARTUPINFO(ctypes.Structure):
        _fields_ = [
            ('cb', wintypes.DWORD),
            ('lpReserved', wintypes.LPWSTR),
            ('lpDesktop', wintypes.LPWSTR),
            ('lpTitle', wintypes.LPWSTR),
            ('dwX', wintypes.DWORD),
            ('dwY', wintypes.DWORD),
            ('dwXSize', wintypes.DWORD),
            ('dwYSize', wintypes.DWORD),
            ('dwXCountChars', wintypes.DWORD),
            ('dwYCountChars', wintypes.DWORD),
            ('dwFillAttribute', wintypes.DWORD),
            ('dwFlags', wintypes.DWORD),
            ('wShowWindow', wintypes.WORD),
            ('cbReserved2', wintypes.WORD),
            ('lpReserved2', ctypes.c_char_p),
            ('hStdInput', wintypes.HANDLE),
            ('hStdOutput', wintypes.HANDLE),
            ('hStdError', wintypes.HANDLE),
        ]

    class PROCESS_INFORMATION(ctypes.Structure):
        _fields_ = [
            ('hProcess', wintypes.HANDLE),
            ('hThread', wintypes.HANDLE),
            ('dwProcessId', wintypes.DWORD),
            ('dwThreadId', wintypes.DWORD),
        ]

    si = STARTUPINFO()
    si.cb = ctypes.sizeof(STARTUPINFO)
    si.lpDesktop = "winsta0\\default"
    si.dwFlags = 1
    si.wShowWindow = 1

    pi = PROCESS_INFORMATION()

    res = ctypes.windll.kernel32.CreateProcessW(
        None, cmd_line, None, None, False, 0x00000010, None, emu_dir,
        ctypes.byref(si), ctypes.byref(pi)
    )
    print("CreateProcess returned:", res)

if __name__ == '__main__':
    start()
