build: components
	component build --out ./public --copy # no symlinks for heroku

build-dev: components-dev
	component build --out ./public --copy --dev

clean:
	rm -fr components public

components: component.json
	component install

components-dev: component.json
	component install --dev

test:
	foreman start

.PHONY: test