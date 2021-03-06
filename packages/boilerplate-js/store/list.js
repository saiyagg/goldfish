import { observable, state } from '@goldfishjs/core';
import request from '../common/request';

const localAvatarUrl = [
  '/common/assets/avatar/boy-1.png',
  '/common/assets/avatar/boy.png',
  '/common/assets/avatar/girl-1.png',
  '/common/assets/avatar/girl.png',
  '/common/assets/avatar/man-1.png',
  '/common/assets/avatar/man-2.png',
  '/common/assets/avatar/man-3.png',
  '/common/assets/avatar/man-4.png',
  '/common/assets/avatar/man.png',
];

class List {
  // State statement means this properties need to be observable.
  loading = state(false);
  showDialog = state(true);
  list = state([]);
  isEmpty = state(false);

  // Any compute operation of data, need integrate to store.
  async getList(config = {}) {
    if (this.loading) return;

    this.loading = true;
    const data = await request({
      url: '/api/list'
    }) || [];

    // Random Avatar
    data.forEach(item => {
      if (!item.avatar) {
        item.avatar = localAvatarUrl[Math.floor(Math.random() * localAvatarUrl.length)];
      }
    });

    if (config.append) {
      this.list.push(...data);
    } else {
      this.list = [...data];
    }

    this.isEmpty = this.list.length < 1;
    this.loading = false;
  };

  toggleHeart(name) {
    const index = this.list.findIndex(item => item.name === name);
    // Make sure the list data must have heart property in the beginning.
    this.list[index].heart = !this.list[index].heart;
  }
}

// MyPageStore need observable
export default observable(List);