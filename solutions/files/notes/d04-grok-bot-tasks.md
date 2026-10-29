# D4 ワークシート

依頼文: sample-app の ISSUE.md の不具合を grok/fix-overdue のブランチで直し、テストを足して下書きの PR を出したら止まって
完了条件: grok/fix-overdue のブランチで npm test が終了コード 0 で通り、出力が返信に貼られていたら完了
確認手順: gh pr checkout <番号> && npm test
