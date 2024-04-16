all: wasm_compile typescript_compile watch_wasm typescript_watch

types: wasm_types typescript_types

docker:
	docker compose up || docker-compose up

g++_compilation:
	g++ wasm/test.cpp wasm/CNetwork.cpp wasm/CNeuron.cpp wasm/CConnection.cpp -o wasm/test -g -Wall -pedantic

wasm_types:
	make wasm_compile FLAGS="-fsyntax-only"

wasm_compile:
	emcc $(FLAGS) -lembind -o build_wasm/asm_core.js wasm/AsmCore.cpp wasm/CNetwork.cpp wasm/CNeuron.cpp wasm/CConnection.cpp \
	-O2 -s MODULARIZE=1 -s EXPORT_ES6=1 -sENVIRONMENT="web" --no-entry

watch_wasm:
	inotifywait -m -e modify,create,delete --format '%w%f' wasm/ | while read FILE; do make wasm_compile; done &

typescript_compile:
	npm run build

typescript_watch:
	npm run watch & npm run preview

typescript_types:
	npm run types-check