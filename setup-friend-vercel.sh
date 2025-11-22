#!/bin/bash

# Script to help friend set up their own Vercel deployment
# This works because friend is already a GitHub collaborator

echo "🔧 Friend Vercel Setup Guide"
echo "============================"
echo ""
echo "Since Vercel Hobby Plan doesn't allow team members,"
echo "your friend can deploy their own Vercel project linked to the same GitHub repo."
echo ""
echo "Steps for your friend (sven.kelling@gmail.com):"
echo ""
echo "1. Go to: https://vercel.com/signup"
echo "   Sign up with: sven.kelling@gmail.com"
echo ""
echo "2. After signing up, go to: https://vercel.com/new"
echo "   Import repository: chickenloop3845-commits/chickenloop"
echo ""
echo "3. Configure environment variables:"
echo "   - MONGODB_URI: mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369"
echo "   - JWT_SECRET: (get from project owner)"
echo ""
echo "4. Deploy!"
echo ""
echo "Result: Friend will have their own Vercel deployment"
echo "         that uses the same GitHub repo and database."
echo ""
echo "Alternative: Upgrade to Vercel Pro Team ($20/month)"
echo "             to add team members directly."
echo ""

