package com.google.step.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

/** Servlet responses to redirect the easy link to another website*/
@WebServlet("/*")
public class RedirectionServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    PrintWriter out = response.getWriter();
    String requestUrl = request.getRequestURI();
    if (requestUrl.isEmpty()) {
      // Invalid input url, redirect to the home page
      response.sendRedirect(HOME_PAGE);
      return;
    }
    
    // Link Redirection
    if (requestUrl.charAt(1) == '~' || ServletHelper.USERSERVICE.isUserLoggedIn()) {
      String responseUrl = ServletHelper.fetchUrlWithDefault(requestUrl.substring(1),
          requestUrl.charAt(1) == '~' ? ServletHelper.ADMIN : ServletHelper.USERSERVICE.getCurrentUser().getEmail(),
          null);
    
      if (responseUrl == null) {
        // Alert user if no url is found and redirect to home page
        out.println("<script type=\"text/javascript\">");
        out.println("alert('No URL is found, please check your input');");
        out.println("location='index.html';");
        out.println("</script>");
        out.close();
      } else {
        response.sendRedirect(responseUrl);
      }
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