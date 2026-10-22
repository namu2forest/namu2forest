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
    title: '동탄 나무 부동산 매물 안내',
    category: '매물정보',
    author: '서주용 대표',
    createdAt: '2026-08-25',
    summary: '다양한 매물을 정직하게 소개하겠습니다.',
    content: `# 아래 링크로 접속하시면\n# 바로 확인이 가능합니다.\n\n[▶▶ 매물 바로 보기 ◀◀](https://fin.land.naver.com/realtors/NxfYD92blIlM9wB4JV)\n\n[**전화 상담 문의**: 010-5635-2684](tel:01056352684)`
  }
];

class PostDB {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    } else {
      try {
        const posts = JSON.parse(stored);
        let updated = false;
        posts.forEach(p => {
          if (p.id === 'post-2') {
            p.title = '동탄 나무 부동산 매물 안내';
            p.summary = '다양한 매물을 정직하게 소개하겠습니다.';
            p.content = `아래 링크로 접속하시면\n바로 확인이 가능합니다.\n\n[▶▶ 매물 바로 보기 ◀◀](https://fin.land.naver.com/realtors/NxfYD92blIlM9wB4JV)\n\n[**전화 상담 문의**: 010-5635-2684](tel:01056352684)`;
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        }
      } catch (e) {
        console.error('Failed to migrate posts in LocalStorage', e);
      }
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