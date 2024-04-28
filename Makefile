WASM_FLAGS := -lembind -O2 -s MODULARIZE=1 -s EXPORT_ES6=1 -sENVIRONMENT="web" --no-entry

all: typescript_install compile

compile: wasm_compile typescript_compile webpage_preview

types: wasm_types typescript_types

docker:
	docker compose up || docker-compose up

g++_compile:
	g++ wasm/test.cpp wasm/CNetwork.cpp wasm/CNeuron.cpp wasm/CConnection.cpp -o wasm/test -g -Wall -pedantic

wasm_compile:
	emcc $(WASM_FLAGS) $(WASM_EXTRA_FLAGS) -o build_wasm/asm_core.js wasm/AsmCore.cpp wasm/CNetwork.cpp wasm/CNeuron.cpp wasm/CConnection.cpp

wasm_types:
	make wasm_compile WASM_EXTRA_FLAGS="-fsyntax-only"

wasm_compile-dev:
	make wasm_compile WASM_EXTRA_FLAGS="-sASSERTIONS"

watch_wasm:
	inotifywait -m -e modify,create,delete --format '%w%f' wasm/ | while read FILE; do make wasm_compile; done &

typescript_install:
	npm i

typescript_compile:
	npm run build

typescript_watch:
	npm run watch & npm run preview

typescript_types:
	npm run types-check

webpage_preview:
	npm run preview