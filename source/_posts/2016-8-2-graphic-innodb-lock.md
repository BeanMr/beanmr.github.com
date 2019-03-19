---
layout: post
title: "图解Innodb锁子系统"
categories:
- MySQL
tags:
- InnoDB
- Lock
---
## InnoDB锁子系统设计目标

## 逻辑锁设计及行级锁问题

## Innodb存储模型

### 数据库文件
{% codeblock lang:sql %}
show variables like 'innodb_file_per_table';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| innodb_file_per_table | ON    |
+-----------------------+-------+
1 row in set (0.00 sec)

create database `graphic_innodb`;

CREATE TABLE `graphic_innodb`.`db_file_store` (
  `clu_key` INT NOT NULL AUTO_INCREMENT,
  `idx_key` VARCHAR(45) NULL,
  `data_col` VARCHAR(3800) NULL,
  PRIMARY KEY (`clu_key`),
  INDEX `se_idx` USING BTREE (`idx_key` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;
{% endcodeblock %}

14.11.2 Role of the .frm File for InnoDB Tables

MySQL stores its data dictionary information for tables in .frm files in database directories. Unlike other MySQL storage engines, InnoDB also encodes information about the table in its own internal data dictionary inside the tablespace. When MySQL drops a table or a database, it deletes one or more .frm files as well as the corresponding entries inside the InnoDB data dictionary. You cannot move InnoDB tables between databases simply by moving the .frm files.


{% codeblock lang:python %}
% python py_innodb_page_info.py -v /usr/local/mysql/data/graphic_innodb/db_file_store.ibd
page offset 00000000, page type <File Space Header>
page offset 00000001, page type <Insert Buffer Bitmap>
page offset 00000002, page type <File Segment inode>
page offset 00000003, page type <B-tree Node>, page level <0000>
page offset 00000004, page type <B-tree Node>, page level <0000>
page offset 00000000, page type <Freshly Allocated Page>
page offset 00000000, page type <Freshly Allocated Page>
Total number of page: 7:
Freshly Allocated Page: 2
Insert Buffer Bitmap: 1
File Space Header: 1
B-tree Node: 2
File Segment inode: 1
{% endcodeblock %}


## InnoDB锁子系统关键对象

## InnoDB行级锁对象

