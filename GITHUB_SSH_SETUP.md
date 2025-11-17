# 🔐 GitHub SSH Setup Guide

This guide explains how to set up SSH authentication for GitHub, allowing you to push and pull code without entering passwords or tokens.

## What is SSH?

SSH (Secure Shell) uses a pair of cryptographic keys:
- **Private Key**: Stays on your computer (never share this!)
- **Public Key**: Add this to GitHub (safe to share)

## Prerequisites

- Git installed on your machine
- A GitHub account
- Terminal/command line access

## Step 1: Check if You Already Have SSH Keys

First, check if you already have SSH keys:

```bash
ls -la ~/.ssh/id_rsa*
```

If you see files like `id_rsa` and `id_rsa.pub`, you already have keys! Skip to Step 3.

## Step 2: Generate SSH Keys (If Needed)

If you don't have SSH keys, generate them:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**When prompted:**
- **File location**: Press Enter to use default (`~/.ssh/id_rsa`)
- **Passphrase**: Optional (press Enter for no passphrase, or enter one for extra security)

This creates two files:
- `~/.ssh/id_rsa` - Your private key (keep secret!)
- `~/.ssh/id_rsa.pub` - Your public key (safe to share)

## Step 3: Get Your Public Key

Display your public key:

```bash
cat ~/.ssh/id_rsa.pub
```

**Copy the entire output** - it looks like:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDUEprrg+2uK1PbnfBKypvUsOazPV1kGgYhlyzHLQAMMW9oDsAvFLHFq8+IEEpeUQ6r7nN1MRvU223wD/rL8QLGAhWix+5/eEXfAexPsmxgRGovQVHspHaM8SYIGvxmAh3hMCwnW0wVo0/lGVx+wQRSR+ebqwASJAxEnhybQnSUF2bf1JqfbJe4cDizlVeS2VfN/76D9KunFn5g8Vu299W2bpNFe+r/cX3Beek997Q2dqfiGoKo1JHJeJFCRprZAYZX4XwYOtmfji/WkfF58pD708V0Zq5jCQNg9afeahQwyTaOXYiLADzVXE6GIp2CotT6VX62l8XLymluGzn/9ixZeqSEDhZ2aAfmtImHlYSbmNNqL8gqYZgUKEyM9bjOK+WvfwmT+elQQ/M+RGeLauZsua+Jbe+5CPPkZMIgH7WvcoG2fbQKfnl2e83lYIZJv+U+GP1MAt6yP/jr7Cq+5ffwcfiV2r7dP1vHn8t1e6reD2XEtIqPrTXzW8E0n5ZF/k0= your_email@example.com
```

### Quick Copy (macOS)

On macOS, you can copy directly to clipboard:

```bash
pbcopy < ~/.ssh/id_rsa.pub
echo "✅ Public key copied to clipboard!"
```

## Step 4: Add Public Key to GitHub

1. **Go to GitHub SSH Settings:**
   - Visit: https://github.com/settings/keys
   - Or: GitHub → Your Profile → Settings → SSH and GPG keys

2. **Click "New SSH key"** (green button)

3. **Fill in the form:**
   - **Title**: Give it a descriptive name (e.g., "My MacBook Air", "Work Laptop")
   - **Key type**: Authentication Key (default)
   - **Key**: Paste your public key (the one you copied in Step 3)

4. **Click "Add SSH key"**

5. **Confirm** (you may be asked for your GitHub password)

## Step 5: Test SSH Connection

Test that everything works:

```bash
ssh -T git@github.com
```

**Success looks like:**
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

**If you see "Permission denied":**
- Make sure you added the public key (not private key) to GitHub
- Wait a minute and try again (GitHub may need a moment to sync)
- Check that you copied the entire key

## Step 6: Configure Git to Use SSH

### Check Current Remote URL

```bash
git remote -v
```

### Change HTTPS to SSH (If Needed)

If your remote is using HTTPS (`https://github.com/...`), change it to SSH:

```bash
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

**Example:**
```bash
git remote set-url origin git@github.com:chickenloop3845-commits/chickenloop.git
```

### Verify the Change

```bash
git remote -v
```

Should now show:
```
origin  git@github.com:USERNAME/REPOSITORY.git (fetch)
origin  git@github.com:USERNAME/REPOSITORY.git (push)
```

## Step 7: Use SSH for Git Operations

Now you can use Git normally - SSH will handle authentication automatically:

```bash
# Push to GitHub
git push origin main

# Pull from GitHub
git pull origin main

# Clone a repository
git clone git@github.com:USERNAME/REPOSITORY.git
```

**No passwords or tokens needed!** 🎉

## Troubleshooting

### "Permission denied (publickey)"

**Solutions:**
1. Make sure you added the **public key** (`.pub` file) to GitHub, not the private key
2. Verify the key was copied completely (should start with `ssh-rsa` and end with your email)
3. Check SSH agent is running:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_rsa
   ```

### "Host key verification failed"

**Solution:**
```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

### Multiple SSH Keys

If you have multiple GitHub accounts or keys:

1. Create/edit `~/.ssh/config`:
   ```
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_rsa
   ```

2. For multiple accounts, use different hosts:
   ```
   Host github.com-personal
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_rsa_personal
   
   Host github.com-work
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_rsa_work
   ```

3. Then use: `git@github.com-personal:USERNAME/REPO.git`

### Key Permissions

Make sure your keys have correct permissions:

```bash
chmod 600 ~/.ssh/id_rsa      # Private key: read/write for owner only
chmod 644 ~/.ssh/id_rsa.pub  # Public key: readable by all
chmod 700 ~/.ssh              # SSH directory: owner only
```

## Security Best Practices

✅ **DO:**
- Keep your private key secure (never share it)
- Use a passphrase for extra security
- Use different keys for different purposes (work vs personal)
- Regularly rotate keys (generate new ones every year or so)

❌ **DON'T:**
- Share your private key (`id_rsa`)
- Commit private keys to Git repositories
- Use the same key for multiple services
- Post your private key online

## Benefits of SSH

- ✅ **No passwords**: Never enter credentials again
- ✅ **More secure**: Uses cryptographic keys instead of passwords
- ✅ **Faster**: No credential prompts
- ✅ **Works everywhere**: Same key works for all Git operations
- ✅ **Better for automation**: CI/CD pipelines can use SSH keys

## Quick Reference

```bash
# Generate new SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Display public key
cat ~/.ssh/id_rsa.pub

# Copy to clipboard (macOS)
pbcopy < ~/.ssh/id_rsa.pub

# Test connection
ssh -T git@github.com

# Change remote to SSH
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git

# Check remote URL
git remote -v
```

## Additional Resources

- [GitHub SSH Documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub SSH Key Settings](https://github.com/settings/keys)
- [SSH Key Generation Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

---

**Need Help?** If you're stuck, check the troubleshooting section above or refer to GitHub's official documentation.

