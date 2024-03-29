install: install-deps

install-deps:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-debug:
	DEBUG=page-loader npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8


