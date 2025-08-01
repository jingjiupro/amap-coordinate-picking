<template>
  <div class="address-search">
    <div class="search-container">
      <input 
        id="tipinput"
        type="text" 
        v-model="searchValue" 
        placeholder="输入地址、POI..." 
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch" class="search-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div v-if="searchResults.length > 0" class="search-results">
      <div 
        v-for="(result, index) in searchResults" 
        :key="index" 
        class="result-item"
        @click="selectResult(result)"
      >
        <div class="result-name">{{ result.name }}</div>
        <div class="result-address">{{ result.address }}</div>
      </div>
    </div>
    <div v-if="isSearching" class="searching-indicator">
      <div class="spinner-small"></div>
      <span>搜索中...</span>
    </div>
    <div v-if="error" class="search-error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
}

export default defineComponent({
  name: 'AddressSearch',
  emits: ['location-selected'],
  setup(_, { emit }) {
    const searchValue = ref('');
    const searchResults = ref<SearchResult[]>([]);
    const isSearching = ref(false);
    const error = ref('');
    const autoComplete = ref<any>(null);
    const placeSearch = ref<any>(null);

    // 初始化地点搜索服务
    onMounted(() => {
      if (window.AMap) {
        // 加载需要的插件
        window.AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], () => {
          initSearchServices();
        });
      }
    });

    // 初始化搜索服务
    const initSearchServices = () => {
      // 初始化AutoComplete
      const autoOptions = {
        input: "tipinput"
      };
      autoComplete.value = new window.AMap.AutoComplete(autoOptions);
      
      // 初始化PlaceSearch
      placeSearch.value = new window.AMap.PlaceSearch({
        pageSize: 10,
        pageIndex: 1,
        citylimit: false
      });

      // 监听AutoComplete的选择事件
      autoComplete.value.on("select", handleAutoCompleteSelect);
    };

    // 处理AutoComplete选择事件
    const handleAutoCompleteSelect = (e: any) => {
      console.log('AutoComplete选择:', e);
      if (e.poi && e.poi.name) {
        // 设置城市并搜索
        if (e.poi.adcode) {
          placeSearch.value.setCity(e.poi.adcode);
        }
        performPlaceSearch(e.poi.name);
      }
    };

    // 执行地点搜索
    const performPlaceSearch = (keyword: string) => {
      isSearching.value = true;
      searchResults.value = [];
      error.value = '';

      placeSearch.value.search(keyword, (status: string, result: any) => {
        isSearching.value = false;
        console.log('PlaceSearch结果:', status, result);
        
        if (status === 'complete' && result.info === 'OK') {
          // 搜索成功
          searchResults.value = result.poiList.pois.map((poi: any) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address || '暂无详细地址',
            location: {
              lng: poi.location.lng,
              lat: poi.location.lat
            }
          }));
        } else {
          // 搜索失败
          error.value = '未找到匹配的地址，请尝试其他关键词';
        }
      });
    };

    // 处理搜索按钮点击
    const handleSearch = () => {
      if (!searchValue.value.trim()) {
        return;
      }

      // 直接使用PlaceSearch进行搜索
      performPlaceSearch(searchValue.value.trim());
    };

    // 选择搜索结果
    const selectResult = (result: SearchResult) => {
      emit('location-selected', result.location);
      searchResults.value = [];
      searchValue.value = '';
    };

    return {
      searchValue,
      searchResults,
      isSearching,
      error,
      handleSearch,
      selectResult
    };
  }
});
</script>

<style scoped>
.address-search {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  z-index: 100;
}

.search-container {
  display: flex;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

input {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  border: none;
  outline: none;
  background: white;
}

.search-button {
  width: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #5a71e0 0%, #6a3d9a 100%);
}

.search-results {
  margin-top: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.result-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: #666;
}

.searching-indicator {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

.search-error {
  margin-top: 8px;
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .address-search {
    width: 90%;
  }
}
</style> 