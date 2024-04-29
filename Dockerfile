FROM emscripten/emsdk

RUN apt update && apt install -y \
    make \
    inotify-tools