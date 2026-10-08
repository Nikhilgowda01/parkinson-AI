"""
Script to push the ParkinsonVoice backend repository to GitHub.

Usage:
    python push_repo.py <GITHUB_TOKEN>
    OR
    $env:GITHUB_TOKEN="your_token_here"
    python push_repo.py
"""
import os
import sys
from dulwich import porcelain
from dulwich.repo import Repo

def push(token: str = None):
    token = token or os.environ.get("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()

    repo = Repo(".")
    branch = "refs/heads/main"

    if not token:
        print("\n" + "=" * 60)
        print("GitHub Personal Access Token (PAT) Required")
        print("=" * 60)
        print("To push to https://github.com/prakruthip25csdip-bot/Backend.git,")
        print("GitHub requires a Personal Access Token with 'repo' scope.\n")
        print("1. Go to: https://github.com/settings/tokens")
        print("2. Generate a new token with 'repo' scope")
        print("3. Run: python push_repo.py <YOUR_TOKEN>\n")
        sys.exit(1)

    remote_url = f"https://{token}@github.com/prakruthip25csdip-bot/Backend.git"
    print("🚀 Pushing to https://github.com/prakruthip25csdip-bot/Backend.git (branch: main)...")
    
    try:
        porcelain.push(repo, remote_url, f"{branch}:{branch}", force=True)
        print("✅ Successfully pushed to GitHub!")
        print("🔗 View repository: https://github.com/prakruthip25csdip-bot/Backend")
    except Exception as e:
        print(f"❌ Push failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    push()
