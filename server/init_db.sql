CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `TrainingHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `training_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `model` varchar(255) NOT NULL,
  `duration` float DEFAULT NULL,
  `parameters` json DEFAULT NULL,
  `weight_path` varchar(255) DEFAULT NULL,
  `confusion_matrix` json DEFAULT NULL,
  `image_paths` json DEFAULT NULL,
  `description` text DEFAULT NULL,
  `result_path` varchar(255) DEFAULT NULL,
  `shap_file_path` varchar(255) DEFAULT NULL,
  `features` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
