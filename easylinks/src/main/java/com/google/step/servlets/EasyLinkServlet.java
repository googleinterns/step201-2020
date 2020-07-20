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
    String easyLink = ServletHelper.getParameterWithDefault(request, "easy-link", );
    if (!easyLink.startsWith(HTTP)) {
      easyLink = HTTP + easyLink;
    }
    response.sendRedirect(easyLink);
  }

  private static final String HTTP = "http://";
}