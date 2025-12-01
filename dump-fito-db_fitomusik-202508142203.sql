-- MySQL dump 10.13  Distrib 9.3.0, for macos15.4 (arm64)
--
-- Host: 127.0.0.1    Database: db_fitomusik
-- ------------------------------------------------------
-- Server version	8.4.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Comments`
--

DROP TABLE IF EXISTS `Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Comments` (
  `comment_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `comment_content` text COLLATE utf8mb4_general_ci,
  `post_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `Posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comments`
--

LOCK TABLES `Comments` WRITE;
/*!40000 ALTER TABLE `Comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `Comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PostCategories`
--

DROP TABLE IF EXISTS `PostCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PostCategories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category_slug` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PostCategories`
--

LOCK TABLES `PostCategories` WRITE;
/*!40000 ALTER TABLE `PostCategories` DISABLE KEYS */;
INSERT INTO `PostCategories` VALUES (1,'Berita','berita'),(2,'Kegiatan Minggu','kegiatan-minggu');
/*!40000 ALTER TABLE `PostCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `post_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `post_title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_slug` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_content` text COLLATE utf8mb4_general_ci,
  `post_excerpt` text COLLATE utf8mb4_general_ci,
  `post_cover_image` text COLLATE utf8mb4_general_ci,
  `post_author_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_category_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_status` enum('draft','published') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `post_view_count` int NOT NULL DEFAULT '0',
  `post_published_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
INSERT INTO `Posts` VALUES ('PST0001','Lorem ipsum dolor sit amet,','lorem-ipsum-dolor-sit-amet','<p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacus est, cursus sed enim vel, volutpat accumsan ante. Duis enim lacus, commodo vel odio id, egestas vulputate urna. Nullam tincidunt dolor euismod gravida convallis. Ut eu nisi imperdiet, interdum purus sit amet, consectetur nibh. Fusce vitae lacus a nisi egestas fermentum vitae ac eros. Nunc egestas metus eu elit cursus, vel accumsan massa maximus. Integer aliquam risus nulla, in hendrerit justo lacinia a. Ut vitae turpis id purus aliquet gravida vitae a felis. Duis malesuada est vel leo pellentesque mollis. Nullam dictum, ligula vel vehicula tempor, arcu mauris dapibus mi, non imperdiet quam erat aliquet diam. Phasellus a est dapibus, posuere ex a, volutpat urna. Ut consequat nulla libero, eget hendrerit purus imperdiet vitae. Proin auctor eros condimentum dui elementum cursus. Sed at sollicitudin mauris. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc pharetra volutpat tortor semper volutpat.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Nullam nec justo sed libero facilisis mattis. Cras cursus semper ornare. Cras sit amet ligula non mi consectetur vehicula. Mauris id luctus diam, quis suscipit dolor. Fusce dapibus ante quis mattis finibus. Cras at ligula quam. Proin tellus dui, fringilla non dui a, porta eleifend nisi. Suspendisse et dui blandit, vehicula nulla ut, tempor velit. Vivamus condimentum turpis leo, et imperdiet velit lobortis in. Etiam consectetur, diam vitae pretium interdum, neque ligula dictum tortor, eu aliquam lacus leo in diam.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Donec lobortis a nunc nec rhoncus. Mauris cursus nisl ligula, id semper mi eleifend efficitur. Donec fringilla ipsum vitae egestas venenatis. Morbi fringilla ultrices odio ut vestibulum. Aliquam erat volutpat. Proin sed risus vel dui lobortis bibendum sit amet quis nulla. Nunc porta enim eget erat consequat, quis tincidunt magna varius. Vestibulum ex diam, imperdiet nec turpis eu, ultricies consectetur magna. Suspendisse luctus ornare posuere. Pellentesque nec lorem in lacus accumsan molestie. Aenean scelerisque ligula et lectus commodo, placerat iaculis sapien finibus. Pellentesque lobortis gravida semper.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Aliquam erat volutpat. Sed facilisis rhoncus massa non gravida. Praesent ligula mauris, fringilla sit amet justo non, auctor eleifend turpis. Donec vehicula purus quis sapien suscipit porta. Nullam ultrices tempus velit ac fermentum. Pellentesque auctor laoreet risus, in venenatis ex tempor non. Suspendisse at iaculis ante, sollicitudin blandit diam. Maecenas dictum metus ac nunc porttitor, non auctor massa varius. Pellentesque eu augue at turpis placerat vehicula. Nulla vel nibh nec turpis porttitor ultrices a ac leo. Donec nec dignissim sem. Morbi malesuada ante eget eros bibendum, varius efficitur risus tempor. Phasellus id maximus lectus. Ut auctor, lorem in egestas dapibus, arcu elit interdum elit, blandit auctor metus orci sed ligula. Sed interdum vitae tellus sit amet cursus.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Morbi sollicitudin suscipit justo, nec viverra quam ornare porttitor. Etiam iaculis consequat sapien eget tincidunt. Nunc lobortis purus nisl, nec viverra nunc elementum id. Quisque ut velit lobortis tortor dignissim laoreet. Vestibulum eu sagittis dui. Quisque non interdum orci. Phasellus posuere tincidunt feugiat. Etiam sollicitudin tortor vitae laoreet mollis. Aliquam iaculis facilisis tellus eu tempor. Nunc semper diam sed mauris mattis tempor ultrices nec massa. Duis mattis fermentum enim. Nulla quis eros consectetur, laoreet augue eget, auctor justo. Maecenas nec ullamcorper nulla, non viverra leo. Pellentesque a hendrerit sem.</span></p><p><br></p>','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacus est, cursus sed enim vel, volutpat accumsan ante.','uploads/posts/post_cover_image-1753285016848-301552427.jpg','USR001','1','published',38,NULL,'2025-07-23 15:36:56','2025-08-14 14:54:12'),('PST0002','Lorem Ipsum Dolor um','lorem-ipsum-dolor-um','<p><br></p>','Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...','uploads/posts/post_cover_image-1753513094144-347202999.jpg','USR001','2','published',12,NULL,'2025-07-24 13:47:03','2025-07-29 14:32:53'),('PST0003','tes berita1','tes-berita1','<p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius porta turpis tempus porttitor. Suspendisse potenti. Nullam quis auctor urna. Donec condimentum consectetur sem, in accumsan justo. Etiam sagittis mattis odio ac mattis. Pellentesque molestie dapibus tortor, ac viverra odio rutrum id. Suspendisse luctus nulla massa, ultrices placerat velit malesuada in. Nulla a pulvinar justo. Etiam ultrices, mi in facilisis viverra, turpis ligula vulputate urna, vel efficitur leo turpis eu velit. Maecenas dictum, est a finibus facilisis, mauris justo ultricies ante, a ultricies ipsum quam in est. Sed fringilla sollicitudin sodales. Donec posuere sodales neque fringilla mollis. Praesent quis dictum erat. Sed venenatis, leo cursus congue iaculis, enim velit pulvinar odio, nec iaculis urna diam aliquet dui.</span></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Praesent tempus mollis sapien vel facilisis. Nulla facilisi. In volutpat leo nisl, quis egestas ipsum feugiat vel. Praesent pharetra lectus in tellus maximus, id eleifend nisl vulputate. Sed placerat neque feugiat, porta dolor a, ultrices lorem. Maecenas quis vestibulum lacus. Proin in venenatis libero, sit amet tristique libero. Vestibulum pharetra mi eget est varius, vel pretium sapien pretium.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Quisque mattis nisi sed metus mattis, at rhoncus lorem gravida. Nulla facilisi. Integer sodales ultrices leo. Cras fringilla enim ante, a dignissim nunc accumsan sit amet. Vestibulum commodo est vel pretium consequat. Pellentesque quam neque, maximus et nulla eu, consequat molestie purus. Suspendisse pellentesque maximus interdum. Ut mattis scelerisque arcu at laoreet. Donec sit amet nisi ac neque pellentesque ultrices. Morbi vitae luctus turpis. Nunc eget dignissim risus. Duis non maximus enim, et semper ipsum.</span></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Vestibulum vulputate dolor ut nibh commodo, nec euismod nisi pharetra. Aenean tristique ipsum luctus, accumsan nisl quis, sagittis nulla. Morbi in eleifend nibh. Praesent ultricies urna magna, vel vulputate odio pharetra dignissim. Aenean auctor malesuada turpis vitae hendrerit. Etiam dictum ultricies velit vitae posuere. Vestibulum vel faucibus diam, eu pharetra nisl.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Nullam quis hendrerit quam. Proin porta, justo et ultrices accumsan, lacus lectus bibendum ligula, a fermentum enim dolor at quam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque mattis, elit id accumsan cursus, urna lorem auctor dui, volutpat gravida orci nisl in ligula. Nam faucibus ac felis a aliquam. Cras risus urna, rhoncus vitae tempor vitae, ullamcorper consequat ligula. Suspendisse et risus luctus, feugiat quam sed, lacinia est. Sed quis nibh quis elit gravida pulvinar a id arcu. In hac habitasse platea dictumst. Nulla nec urna vitae nunc pulvinar ornare. Fusce sit amet bibendum quam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce elit risus, rhoncus nec ultrices sit amet, dignissim id orci. Maecenas aliquam turpis sit amet posuere blandit. Nulla vestibulum arcu vitae nisl auctor venenatis.</span></p><p><br></p>','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius porta turpis tempus porttitor. Suspendisse potenti','uploads/posts/post_cover_image-1753514107190-16056836.jpg','USR001','1','published',12,NULL,'2025-07-26 07:15:07','2025-08-14 14:54:11'),('PST0004','tes berita 2','tes-berita-2','<p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis felis magna, euismod id pretium a, elementum ac dui. Mauris venenatis imperdiet eros, vel scelerisque dolor posuere at. Proin lacinia eget nulla quis luctus. Nullam in elementum arcu. Aenean rutrum, ante non hendrerit rutrum, risus odio malesuada risus, nec malesuada lacus lorem eget urna. Sed suscipit et nunc in egestas. Nam bibendum elit in odio tincidunt, id elementum nulla vestibulum. In ac mollis sem. Nulla ex quam, vulputate sed commodo sit amet, vulputate et sapien. Curabitur eleifend ultricies pellentesque. In gravida convallis lorem, nec tempus odio tincidunt sit amet. Vestibulum venenatis tristique tellus ac varius. Vivamus sit amet neque placerat, tristique ipsum tincidunt, tincidunt sapien. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In nec pulvinar nunc.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Proin non nisl varius, blandit nisi ac, malesuada arcu. Praesent nec malesuada enim, sed sodales est. Vestibulum pulvinar ipsum faucibus enim varius aliquam. Nunc sagittis orci at ex dignissim, vitae convallis tellus efficitur. Aliquam bibendum dui convallis vulputate cursus. In lacinia erat a rhoncus consectetur. Donec feugiat nisi eu convallis volutpat. Nullam dignissim sagittis semper. Aenean ornare, quam a ullamcorper dignissim, diam ipsum volutpat risus, sed consequat odio nisi convallis sem. Maecenas ornare ut erat et tempor. Praesent egestas tristique est, sit amet facilisis felis laoreet nec. Suspendisse faucibus turpis nisi, eget maximus est mollis sit amet.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Nulla et nulla semper, aliquet velit eu, placerat lacus. In hac habitasse platea dictumst. Ut eget aliquam neque. Nulla lobortis gravida justo, quis eleifend lorem. Cras facilisis posuere lectus at lobortis. Vivamus felis enim, commodo vel metus vel, consequat scelerisque diam. Praesent ac metus in nunc cursus posuere. Integer a elit in magna auctor hendrerit eu facilisis orci. Aliquam congue aliquam metus, ac cursus lacus elementum sed. Ut tristique magna urna, sed scelerisque libero tincidunt quis.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Vivamus ac tellus ullamcorper, finibus massa sit amet, tristique ante. Cras vitae ante vel magna auctor convallis in a metus. Maecenas eu leo euismod, feugiat quam eu, pellentesque ex. Donec pellentesque sapien in convallis tincidunt. In in leo augue. Ut vestibulum ligula ac ex ornare, ut laoreet nisl fringilla. In sit amet ornare massa. Maecenas tempus orci a justo laoreet varius. Phasellus vehicula rutrum dapibus. Nulla eu justo vel nulla interdum auctor. Curabitur dolor libero, tempus ac lorem ac, viverra eleifend lacus.</span></p><p class=\"ql-align-justify\"><span style=\"background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);\">Nam a dui fermentum, ultricies ex non, tincidunt ligula. Praesent sagittis, nunc feugiat fringilla egestas, purus leo tincidunt nibh, nec ultricies arcu nisi a orci. Integer varius semper luctus. Sed porttitor tempus hendrerit. In vitae molestie nisl. Maecenas dignissim, dui ac rutrum vulputate, eros metus cursus risus, at suscipit mi mi non purus. Morbi vel ante vitae leo egestas tincidunt.</span></p><p><br></p>','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis felis magna, euismod id pretium a, elementum ac dui. Mauris venenatis imperdiet eros,','uploads/posts/post_cover_image-1753532096955-198685384.jpg','USR001','1','draft',8,NULL,'2025-07-26 12:14:56','2025-08-14 14:54:04');
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20250719083737-create-user.js'),('20250719093715-create-user-role.js'),('20250719093939-create-menu.js'),('20250719094127-create-user-role-access.js'),('20250721130520-add-photo-to-user.js'),('20250721152624-create-posts.js'),('20250721153012-create-post-category.js'),('20250723140621-add-post-view-count.js'),('20250723141446-create-comments.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_role` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_photo` text COLLATE utf8mb4_general_ci,
  `user_phone` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_access_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('USR001','Mohammad Luqi','$2b$10$ghgBDek5NPw3d9cRctXbC.R/LPAQwDZh/zKCr5da8AdyuxwcJg1u6','luqi@fitomusik.id','SUA',NULL,'+6285225461124','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiVVNSMDAxIiwidXNlcl9uYW1lIjoiTW9oYW1tYWQgTHVxaSIsInVzZXJfcm9sZSI6IlNVQSIsImlhdCI6MTc1NTE4MzE3Nn0.Wx_pcVNFH1DPNB6rPmGit3MDor2mFLNRUcAXe-C78ck','2025-07-19 10:00:05','2025-08-14 14:52:56'),('USR002','Faizin','$2b$10$ghgBDek5NPw3d9cRctXbC.R/LPAQwDZh/zKCr5da8AdyuxwcJg1u6','faizin@fitomusik.id','OWN',NULL,NULL,NULL,'2025-07-19 10:00:05','2025-07-19 10:00:05');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_group` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_nama` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_parent_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'MAIN','DASHBOARD','/dashboard',NULL),(2,'MAIN','MANAGEMENT',NULL,NULL),(3,'MANAGEMENT','USERS','/management/users','MANAGEMENT'),(4,'MAIN','SETTINGS','/settings',NULL);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role_accesses`
--

DROP TABLE IF EXISTS `user_role_accesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_accesses` (
  `roleac_code` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `roleac_master` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `roleac_menu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`roleac_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role_accesses`
--

LOCK TABLES `user_role_accesses` WRITE;
/*!40000 ALTER TABLE `user_role_accesses` DISABLE KEYS */;
INSERT INTO `user_role_accesses` VALUES ('ADM_DASHBOARD','SUA','DASHBOARD'),('ADM_SETTINGS','SUA','SETTINGS'),('ADM_USERS','SUA','USERS'),('MNG_DASHBOARD','SUA','DASHBOARD');
/*!40000 ALTER TABLE `user_role_accesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `role_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('ACC','Accounting'),('EMP','Employee'),('MNG','Manager'),('OWN','Owner'),('SUA','Super Admin'),('USR','Sales');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_fitomusik'
--
