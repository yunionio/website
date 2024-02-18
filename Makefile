.PHONY: build

docker-yarn:
	./tools/run-in-docker.sh

# check: https://docusaurus.io/docs/i18n/tutorial
write-en-translation:
	yarn write-translations --locale en

docker-write-en-translation:
	./tools/run-in-docker.sh write-translations --locale en

start:
	npm run start

docker-start: docker-yarn
	./tools/run-in-docker.sh start --host 0.0.0.0

start-en:
	npm run start -- --locale en

docker-start-en:
	./tools/run-in-docker.sh start --host 0.0.0.0 --locale en

build:
	yarn build

oneline-build:
	./scripts/build.py --edition=ce --multi-versions --no-out-fetch

docker-build:
	./tools/run-in-docker.sh build

build-serve: build
	cd ./build/ && python3 -m http.server 8002

sync-translation-files:
	rsync -avP ./docs/* ./i18n/en/docusaurus-plugin-content-docs/current/

image:
	docker buildx build --platform linux/amd64,linux/arm64 --push -t zexi/cloudpods-docs:v1 -f ./Dockerfile .

sync-changelog:
	mkdir -p ./i18n/en/docusaurus-plugin-content-docs/current/development/changelog
	rsync -avP ./docs/development/changelog/ ./i18n/en/docusaurus-plugin-content-docs/current/development/changelog
	find ./i18n/en/docusaurus-plugin-content-docs/current/development/changelog | grep .md$ | xargs \
		sed -r -i "" "s|相关代码仓库的 CHANGELOG|CHANGELOG of each release Version|g; \
			s|(.*) CHANGELOG 汇总，最近发布版本: (.*) , 时间: (.*)|\1 CHANGELOG Summary, most recent version: \2, time: \3|g; \
			s|发布时间|Released at|g; \
			s|仓库地址|Repo|g"
