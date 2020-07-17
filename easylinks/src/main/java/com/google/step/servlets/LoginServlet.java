package com.google.step.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, 
                    HttpServletResponse response) throws IOException {
    response.setContentType("text/html");
    
    if (USERSERVICE.isUserLoggedIn()) {
      String email = USERSERVICE.getCurrentUser().getEmail();

      if (email.split("@")[1].equals("columbia.edu")) {
        response.getWriter().println("okay-columbia");
      } else {
        // Personal email is allowed for ease of testing
        response.getWriter().println("okay");
      }
    } else {
      // Return Login link if user is not logged in
      response.getWriter().println(USERSERVICE.createLoginURL("/index.html"));
    }
  }

  private static final UserService USERSERVICE = 
      UserServiceFactory.getUserService();
}