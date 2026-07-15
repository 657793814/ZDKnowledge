package com.knowledgepower.user.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.knowledgepower.user.entity.User;
import com.knowledgepower.user.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}
