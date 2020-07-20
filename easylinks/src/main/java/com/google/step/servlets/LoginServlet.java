package com.google.step.servlets;

import com.google.step.servlets.ServletHelper;
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
    
    if (ServletHelper.USERSERVICE.isUserLoggedIn()) {
      String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();

      if (email.split("@")[1].equals("columbia.edu")) {
        response.getWriter().println("okay-columbia");
      } else {
        // Personal email is allowed for ease of testing
        response.getWriter().println("okay");
      }
    } else {
      // Return Login link if user is not logged in
      response.getWriter().println(ServletHelper.USERSERVICE
                                                .createLoginURL("/index.html"));
    }
  }
}