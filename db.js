/**
 * db.js - LocalStorage & GitHub API Hybrid Post Management
 */
const STORAGE_KEY = 'namu_posts_data';
const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: '동탄 나무 부동산 홈페이지 오픈 안내',
    category: '공지사항',
    author: '서주용 대표',
    createdAt: '2026-08-27',
    summary: '안전하고 투명한 부동산 거래를 위해 동탄 나무 부동산 홈페이지가 정식 오픈하였습니다.',
    content: `# 동탄 나무 부동산 홈페이지 오픈\n\n안녕하세요, **동탄 나무 부동산 대표 공인중개사 서주용**입니다.\n\n고객 여러분께 보다 신속하고 투명한 부동산 정보를 전달해 드리고자 정식 홈페이지를 오픈하였습니다.\n\n- **주요 서비스**: 매물 접수, 부동산 상담, 투자 컨설팅\n- **위치**: 경기도 화성시 동탄구 동탄기흥로 447-20 동탄역유퍼스트 1층 112호\n- **문의**: 010-5635-2684 / namu2forest@gmail.com\n\n많은 관심과 이용 부탁드립니다. 감사합니다!`
  },
  {
    id: 'post-2',
    title: '동탄역 유퍼스트 상가 및 사무실 매물 안내',
    category: '매물정보',
    author: '서주용 대표',
    createdAt: '2026-08-25',
    summary: '동탄역 핵심 입지의 상가 및 사무실 추천 매물 안내입니다.',
    content: `# 동탄역 유퍼스트 상가 & 사무실 매물\n\n유동인구가 풍부하고 접근성이 뛰어난 **동탄역 유퍼스트** 매물 안내입니다.\n\n### 매물 특징\n1. **입지**: 동탄역 도보 접근 가능한 역세권\n2. **용도**: 1층 근린생활시설 (상가/사무실 추천)\n3. **상담 문의**: 010-5635-2684`
  }
];

class PostDB {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    }
  }

  getPosts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_POSTS;
    } catch (e) {
      console.error('Failed to parse posts from LocalStorage', e);
      return INITIAL_POSTS;
    }
  }

  getPostById(id) {
    const posts = this.getPosts();
    return posts.find(p => p.id === id);
  }

  savePost(post) {
    const posts = this.getPosts();
    if (post.id) {
      const index = posts.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...post, updatedAt: new Date().toISOString().split('T')[0] };
      } else {
        posts.unshift(post);
      }
    } else {
      const newPost = {
        ...post,
        id: 'post-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      posts.unshift(newPost);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  }

  deletePost(id) {
    let posts = this.getPosts();
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  }

  async syncWithGitHub(token, owner, repo) {
    if (!token || !owner || !repo) return false;
    const path = 'data/posts.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const posts = this.getPosts();
    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));

    try {
      let sha = '';
      const getRes = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}` }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update posts.json via Board Admin',
          content: contentEncoded,
          sha: sha || undefined
        })
      });
      return putRes.ok;
    } catch (e) {
      console.error('GitHub Sync Error:', e);
      return false;
    }
  }
}

window.postDB = new PostDB();
