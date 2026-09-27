import sys
import os
import ctypes
from ctypes import wintypes

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

def launch_on_user_desktop(cmd, cwd=None):
    si = STARTUPINFO()
    si.cb = ctypes.sizeof(STARTUPINFO)
    si.lpDesktop = "winsta0\\default"
    si.dwFlags = 1  # STARTF_USESHOWWINDOW
    si.wShowWindow = 1  # SW_SHOWNORMAL

    pi = PROCESS_INFORMATION()

    CREATE_NEW_CONSOLE = 0x00000010

    success = ctypes.windll.kernel32.CreateProcessW(
        None,
        cmd,
        None,
        None,
        False,
        CREATE_NEW_CONSOLE,
        None,
        cwd,
        ctypes.byref(si),
        ctypes.byref(pi)
    )

    if not success:
        err = ctypes.GetLastError()
        print(f"Failed to create process. Error code: {err}")
        return None

    print(f"Process launched successfully on interactive desktop! PID: {pi.dwProcessId}")
    ctypes.windll.kernel32.CloseHandle(pi.hThread)
    ctypes.windll.kernel32.CloseHandle(pi.hProcess)
    return pi.dwProcessId

if __name__ == '__main__':
    if len(sys.argv) > 1:
        cmd_to_run = " ".join(sys.argv[1:])
        launch_on_user_desktop(cmd_to_run)
    else:
        print("Usage: python launch_desktop.py <command>")
