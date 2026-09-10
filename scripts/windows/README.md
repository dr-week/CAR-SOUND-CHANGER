# Windows launcher

`launch-car-sound-mod.bat` is the single Windows entry point.

| Command | Result |
| --- | --- |
| `launch-car-sound-mod.bat` or `launch-car-sound-mod.bat start` | Starts the Vite server on port 5173 and refuses a second instance. |
| `launch-car-sound-mod.bat start-lan` | Starts a development server reachable on the local network. Use only when deliberate. |
| `launch-car-sound-mod.bat restart` | Stops the process on port 5173, then starts a fresh development server. |
| `launch-car-sound-mod.bat stop` | Stops only the process on port 5173. |
| `launch-car-sound-mod.bat test` | Runs type check, lint, and unit tests. |
| `launch-car-sound-mod.bat build` | Creates the production bundle. |
| `launch-car-sound-mod.bat preview` | Serves the production bundle on port 4173. Run `build` first. |

The launcher uses a Windows named mutex to prevent two launcher-managed instances. Before `stop` or `restart` terminates a listener, it verifies the listener command line belongs to this project; a different application on the same port is refused.
