#!/bin/bash

echo "🚀 Starting Task List backend ..."


echo "🌐 Starting PHP server..."
cd backend && php -S localhost:8000 -t public
