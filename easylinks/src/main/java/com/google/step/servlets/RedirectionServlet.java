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
    String requestUrl = request.getRequestURI();
    if (requestUrl.isEmpty()) {
      // Invalid input url, redirect to the home page
      ServletHelper.showErrorMsg(ServletHelper.EMPTY_INPUT, response.getWriter());
      return;
    }
    
    boolean isUserLoggedIn = ServletHelper.USERSERVICE.isUserLoggedIn();
    String responseUrl = fetchUrlFromShortcut(requestUrl.substring(1), isUserLoggedIn);
    if (responseUrl != null) {
      // URL found, redirect
      response.sendRedirect(responseUrl);
    } else if (isUserLoggedIn) {
      // URL not found and the user is logged in, show the error message
      ServletHelper.showErrorMsg(NOT_FOUND_ERROR_MESSAGE, response.getWriter());
    } else {
      // URL not found and the user is not logged in, prompt to login
      response.sendRedirect(ServletHelper.USERSERVICE.createLoginURL(HOME_PAGE));
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Redirect to the corresponding servlet
    String shortcut = ServletHelper.getParameterWithDefault(request, "easy-link", HOME_PAGE);
    response.sendRedirect(shortcut);
  }

  /** Searches and returns the url mapped by the given shortcut in the DataStore 
   *  @return the url string if presented in the DataStore, null otherwise.
   */
  private static String fetchUrlFromShortcut(String shortcut, boolean isUserLoggedIn) {
    String responseUrl = null;
    // If the user has logged in, search the private DataStore first
    if (isUserLoggedIn) {
      String userEmail = ServletHelper.USERSERVICE.getCurrentUser().getEmail();
      responseUrl = ServletHelper.fetchUrlWithDefault(shortcut, userEmail, null);
    }
    if (responseUrl == null) {
      // Either the user is not log in or the shortcut may be public
      responseUrl = ServletHelper.fetchUrlWithDefault(shortcut, ServletHelper.ADMIN, null);
    }
    return responseUrl;
  }

  private static final String HOME_PAGE = "/index.html";
  private static final String NOT_FOUND_ERROR_MESSAGE = "No URL is found, please check your input.";
}