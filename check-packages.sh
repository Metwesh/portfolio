#!/bin/bash
set -e

echo "🔍 Package Health Check Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check for outdated packages
echo "📦 Step 1: Checking for outdated packages..."
yarn outdated || true
echo ""

# 2. Type checking
echo "🔧 Step 2: TypeScript type checking..."
npx tsc --noEmit
echo -e "${GREEN}✓ Type checking passed${NC}"
echo ""

# 3. Linting
echo "🧹 Step 3: Running linter..."
yarn lint || true
echo ""

# 4. Tests
echo "🧪 Step 4: Running tests..."
yarn test:unit
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

# 5. Build
echo "🏗️  Step 5: Building production bundle..."
yarn build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# 6. Check bundle size
echo "📊 Step 6: Bundle size analysis..."
ls -lh dist/assets/*.js | tail -5
echo ""

echo -e "${GREEN}✅ All checks completed!${NC}"
echo ""
echo "🚀 Next steps:"
echo "   1. Run 'yarn dev' to test locally"
echo "   2. Check browser console for errors"
echo "   3. Test critical user flows manually"
