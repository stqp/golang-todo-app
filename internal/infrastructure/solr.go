package infrastructure

import (
	"fmt"
	"github.com/rtt/Go-Solr"
)

type SolrClient struct {
	client *solr.Connection
}

func NewSolrClient(core string) (*SolrClient, error) {
	conn, err := solr.Init("localhost", 8983, core)
	if err != nil {
		return nil, err
	}
	return &SolrClient{client: conn}, nil
}

// ドキュメント追加
func (s *SolrClient) Add(doc map[string]interface{}) error {
	updateDoc := map[string]interface{}{
		"add": []interface{}{
			map[string]interface{}{ "doc": doc },
		},
	}
	_, err := s.client.Update(updateDoc, true)
	return err
}

// 検索（title, description両方を全文検索）
func (s *SolrClient) Search(keyword string) ([]map[string]interface{}, error) {
	// ワイルドカード検索を使用してより柔軟な検索を実現
	query := fmt.Sprintf("title:*%s* OR description:*%s*", keyword, keyword)
	q := solr.Query{
		Params: solr.URLParamMap{
			"q":    []string{query},
			"rows": []string{"10"},
			"fl":   []string{"id,type,title,description"}, // 必要なフィールドのみを取得
		},
	}
	res, err := s.client.Select(&q)
	if err != nil {
		return nil, err
	}
	results := make([]map[string]interface{}, 0)
	for i := 0; i < res.Results.Len(); i++ {
		doc := res.Results.Get(i)
		row := map[string]interface{}{}
		for k, v := range doc.Fields {
			// 配列の場合は最初の要素を取得
			if arr, ok := v.([]interface{}); ok && len(arr) > 0 {
				row[k] = arr[0]
			} else {
				row[k] = v
			}
		}
		results = append(results, row)
	}
	return results, nil
} 