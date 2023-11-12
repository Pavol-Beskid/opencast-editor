export DOCKER_BUILDKIT=1
docker build \
    --build-arg NODE_VERSION=16 \
    --build-arg CADDY_VERSION=2.5.1 \
    --build-arg PUBLIC_URL= \
    --build-arg REACT_APP_SETTINGS_PATH=/editor-settings.toml \
    -t quay.io/opencast/editor .