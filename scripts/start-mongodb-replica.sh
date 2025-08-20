#!/bin/bash

# MongoDBデータディレクトリの作成
mkdir -p ./data/mongodb

# MongoDBをレプリカセットモードで起動
mongod --replSet rs0 --dbpath ./data/mongodb --port 27017 --bind_ip localhost &

# MongoDBが起動するまで待つ
sleep 5

# レプリカセットを初期化
mongosh --eval "
  rs.initiate({
    _id: 'rs0',
    members: [
      { _id: 0, host: 'localhost:27017' }
    ]
  })
"

echo "MongoDB replica set started successfully!"
echo "Connection string: mongodb://localhost:27017/?replicaSet=rs0"