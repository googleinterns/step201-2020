package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responses to redirect the easy link to another website*/
@WebServlet("/easy-link")
public class EasyLinkServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String easyLink = ServletHelper.getParameterWithDefault(request, "easy-link", "");

    if (easyLink.isEmpty()) {
      response.sendRedirect(HOME_PAGE);
    } else if (easyLink.startsWith(PROVIDED_LINK)) {
      // TODO: Search the datastore to find the link
    } else if (easyLink.startsWith(NAVIGATION_LINK)) {
      // TODO: Navigate
    } else if (easyLink.startsWith(PEOPLE_SEARCH_LINK)) {
      // TODO: Search the people
    } else {
      // TODO: Process the customized link
    }
    
  }

  /** Private constants for different types of link */
  private static final String PROVIDED_LINK = "~";
  private static final String NAVIGATION_LINK = "~where";
  private static final String PEOPLE_SEARCH_LINK = "~who";
  private static final String HOME_PAGE = "/index.html";
}