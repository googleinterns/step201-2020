package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responses to redirect the easy link to another website*/
@WebServlet("/*")
public class RedirectionServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String requestUrl = request.getRequestURI();
    if (requestUrl.isEmpty()) {
      // Invalid input url, redirect to the home page
      response.sendRedirect(HOME_PAGE);
      return;
    }
    
    // Customized Link Redirection
    if (ServletHelper.USERSERVICE.isUserLoggedIn()) {
      String responseUrl = ServletHelper.fetchUrlWithDefault(requestUrl.substring(1),
                              ServletHelper.USERSERVICE.getCurrentUser().getEmail(), HOME_PAGE);
      response.sendRedirect(responseUrl);
    } else {
      response.sendRedirect(ServletHelper.USERSERVICE.createLoginURL(HOME_PAGE));
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Redirect to the corresponding servlet
    String shortcut = ServletHelper.getParameterWithDefault(request, "easy-link", HOME_PAGE);
    response.sendRedirect(shortcut);
  }

  /** Private constants for different types of link */
  private static final String HOME_PAGE = "/index.html";
}